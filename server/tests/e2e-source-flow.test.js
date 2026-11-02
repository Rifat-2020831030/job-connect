import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

const insertedDocs = [];

const mockSourcesCollection = {
  async findOne(query) {
    return (
      insertedDocs
        .filter((d) => d.utm_source === query.utm_source)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] || null
    );
  },
  async insertOne(doc) {
    insertedDocs.push({ ...doc, _id: "mock_" + insertedDocs.length });
    return { acknowledged: true };
  },
};

globalThis._mongoClientPromise = Promise.resolve({
  db: () => ({
    collection: (name) => {
      if (name === "sources") return mockSourcesCollection;
      return {};
    },
  }),
});

const { trackSource, VALID_UTM_SOURCES } = await import("../src/controller/job-stat.js");

describe("Source tracking flow", () => {
  beforeEach(() => {
    insertedDocs.length = 0;
  });

  test("whitelisted values are accepted and normalized", () => {
    assert.deepEqual(VALID_UTM_SOURCES, ["cv", "share", "referral", "social"]);
  });

  test("rejects invalid sources with 400", async () => {
    const invalidInputs = ["facebook", "google", "unknown", "", "   ", null, undefined];
    for (const utm_source of invalidInputs) {
      let statusCode = 200;
      let jsonResponse = null;
      const req = { body: { utm_source }, query: {} };
      const res = {
        status(code) { statusCode = code; return this; },
        json(payload) { jsonResponse = payload; return this; }
      };

      await trackSource(req, res);
      assert.equal(statusCode, 400, `Expected 400 for input: ${utm_source}`);
      assert.equal(jsonResponse.status, 0);
      assert.equal(jsonResponse.message, "Invalid utm_source");
    }
    assert.equal(insertedDocs.length, 0, "No invalid sources should be inserted");
  });

  test("accepts all whitelisted sources in body and query (case-insensitive)", async () => {
    const testCases = [
      { source: "cv", fromQuery: false, expected: "cv" },
      { source: "SHARE", fromQuery: false, expected: "share" },
      { source: "Referral", fromQuery: true, expected: "referral" },
      { source: "social", fromQuery: true, expected: "social" },
    ];

    for (const { source, fromQuery, expected } of testCases) {
      let statusCode = 200;
      let jsonResponse = null;
      const req = {
        body: fromQuery ? {} : { utm_source: source },
        query: fromQuery ? { utm_source: source } : {}
      };
      const res = {
        status(code) { statusCode = code; return this; },
        json(payload) { jsonResponse = payload; return this; }
      };

      await trackSource(req, res);
      assert.equal(statusCode, 200);
      assert.equal(jsonResponse.status, 1);
      assert.equal(jsonResponse.message, "Source recorded");
      assert.ok(insertedDocs.some((d) => d.utm_source === expected));
    }
  });

  test("debounces duplicate calls for the same utm_source within 1 minute", async () => {
    const req = { body: { utm_source: "cv" }, query: {} };
    const res1 = {
      status(code) { return this; },
      json(payload) { return this; }
    };
    await trackSource(req, res1);
    assert.equal(insertedDocs.length, 1);

    // Immediate second call should be debounced and not inserted again
    const res2 = {
      status(code) { return this; },
      json(payload) { return this; }
    };
    await trackSource(req, res2);
    assert.equal(insertedDocs.length, 1);
  });
});
