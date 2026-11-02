import test from "node:test";
import assert from "node:assert/strict";

// Setup mock MongoDB before importing getFeaturedJobs
let lastQuery = null;
let lastSort = null;
let mockJobs = [];
let queryCount = 0;

const mockCollection = {
  find(filter, options) {
    queryCount++;
    lastQuery = filter;
    return {
      sort(sortObj) {
        lastSort = sortObj;
        return {
          limit(n) {
            return {
              toArray: async () => mockJobs.slice(0, n),
            };
          },
        };
      },
    };
  },
};

globalThis._mongoClientPromise = Promise.resolve({
  db: () => ({
    collection: () => mockCollection,
  }),
});

const { getFeaturedJobs } = await import(
  "../src/controller/job-controller/get-featured-jobs.js"
);

function createMockReqRes(section = "featured") {
  const req = { query: { section } };
  let statusCode = 200;
  let jsonResponse = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResponse = data;
      return this;
    },
  };

  return { req, res, getResult: () => ({ statusCode, jsonResponse }) };
}

test("getFeaturedJobs - section=featured sorts by first_seen: -1 and deduplicates by company", async () => {
  mockJobs = [
    {
      _id: "1",
      title: "Dev 1",
      company: "Company Alpha",
      first_seen: "2026-11-02T10:00:00Z",
      salary_max: 50000,
    },
    {
      _id: "2",
      title: "Dev 2",
      company: "Company Alpha", // Same company
      first_seen: "2026-11-01T10:00:00Z",
      salary_max: 200000,
    },
    {
      _id: "3",
      title: "Dev 3",
      company: "Company Beta",
      first_seen: "2026-10-31T10:00:00Z",
      salary_max: 60000,
    },
    {
      _id: "4",
      title: "Dev 4",
      company: "Company Gamma",
      first_seen: "2026-10-30T10:00:00Z",
      salary_max: 70000,
    },
  ];

  const { req, res, getResult } = createMockReqRes("featured");
  await getFeaturedJobs(req, res);

  const { statusCode, jsonResponse } = getResult();
  assert.equal(statusCode, 200);
  assert.equal(jsonResponse.status, 1);

  // Verification that sort is purely first_seen: -1
  assert.deepEqual(lastSort, { first_seen: -1 });

  // Verification that salary_max is NOT required in the filter
  assert.equal(lastQuery.salary_max, undefined);

  // Verification that results are deduplicated by company (Company Alpha only appears once)
  const resultCompanies = jsonResponse.data.map((j) => j.company);
  assert.deepEqual(resultCompanies, [
    "Company Alpha",
    "Company Beta",
    "Company Gamma",
  ]);
  assert.equal(jsonResponse.data[0]._id, "1"); // freshest job from Company Alpha
});

test("getFeaturedJobs - section=engineering sorts by first_seen: -1", async () => {
  mockJobs = [
    {
      _id: "e1",
      title: "Eng 1",
      company: "Company E1",
      first_seen: "2026-11-02T10:00:00Z",
    },
  ];

  const { req, res, getResult } = createMockReqRes("engineering");
  await getFeaturedJobs(req, res);

  const { statusCode, jsonResponse } = getResult();
  assert.equal(statusCode, 200);
  assert.deepEqual(lastSort, { first_seen: -1 });
});

test("getFeaturedJobs - section=leadership filters strictly by PM category and excludes others", async () => {
  mockJobs = [
    {
      _id: "l1",
      title: "Product Manager",
      company: "Company L1",
      category: "PM",
      first_seen: "2026-11-02T10:00:00Z",
    },
  ];

  const { req, res, getResult } = createMockReqRes("leadership");
  await getFeaturedJobs(req, res);

  const { statusCode, jsonResponse } = getResult();
  assert.equal(statusCode, 200);
  assert.deepEqual(lastSort, { first_seen: -1 });

  // Verify that category filter only permits PM and does not have $or with $nin matching 'other'
  assert.equal(lastQuery.$or, undefined, "Must not have $or filter allowing non-PM categories");
  assert.deepEqual(lastQuery.category, { $in: ["PM", "pm"] });
});

test("getFeaturedJobs - invalid section returns 400", async () => {
  const { req, res, getResult } = createMockReqRes("invalid-section");
  await getFeaturedJobs(req, res);

  const { statusCode, jsonResponse } = getResult();
  assert.equal(statusCode, 400);
  assert.equal(jsonResponse.status, 0);
});

test("getFeaturedJobs - backfills up to N when candidates have fewer than 3 unique companies", async () => {
  mockJobs = [
    {
      _id: "1",
      title: "Job 1",
      company: "Company Alpha",
      first_seen: "2026-11-02T10:00:00Z",
    },
    {
      _id: "2",
      title: "Job 2",
      company: "Company Alpha", // Same company
      first_seen: "2026-11-01T10:00:00Z",
    },
    {
      _id: "3",
      title: "Job 3",
      company: "Company Beta", // Only 2 unique companies across 3 jobs
      first_seen: "2026-10-31T10:00:00Z",
    },
  ];

  const { req, res, getResult } = createMockReqRes("featured");
  await getFeaturedJobs(req, res);

  const { statusCode, jsonResponse } = getResult();
  assert.equal(statusCode, 200);
  assert.equal(jsonResponse.data.length, 3);
  assert.deepEqual(
    jsonResponse.data.map((j) => j._id),
    ["1", "3", "2"]
  );
});

test("getFeaturedJobs - executes exactly one db query without any secondary fallback calls", async () => {
  queryCount = 0;
  mockJobs = [
    {
      _id: "507f1f77bcf86cd799439011",
      title: "Job 1",
      company: "Company Alpha",
      first_seen: "2026-11-02T10:00:00Z",
    },
  ];

  const { req, res, getResult } = createMockReqRes("featured");
  await getFeaturedJobs(req, res);

  const { statusCode, jsonResponse } = getResult();
  assert.equal(statusCode, 200);
  assert.equal(jsonResponse.data.length, 1);
  assert.equal(queryCount, 1, "Must make exactly 1 database query, never a 2nd query");
});
