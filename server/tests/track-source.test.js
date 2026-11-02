import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { trackSource, VALID_UTM_SOURCES } from "../src/controller/job-stat.js";

describe("trackSource controller", () => {
  test("defines whitelist containing cv, share, referral, social", () => {
    assert.deepEqual(VALID_UTM_SOURCES, ["cv", "share", "referral", "social"]);
  });

  test("returns 400 for missing or empty utm_source", async () => {
    let statusCode = 200;
    let jsonResponse = null;
    const req = { body: {}, query: {} };
    const res = {
      status(code) { statusCode = code; return this; },
      json(payload) { jsonResponse = payload; return this; }
    };

    await trackSource(req, res);
    assert.equal(statusCode, 400);
    assert.equal(jsonResponse.status, 0);
    assert.equal(jsonResponse.message, "Invalid utm_source");
  });

  test("returns 400 for non-whitelisted utm_source", async () => {
    let statusCode = 200;
    let jsonResponse = null;
    const req = { body: { utm_source: "invalid_source" }, query: {} };
    const res = {
      status(code) { statusCode = code; return this; },
      json(payload) { jsonResponse = payload; return this; }
    };

    await trackSource(req, res);
    assert.equal(statusCode, 400);
    assert.equal(jsonResponse.status, 0);
    assert.equal(jsonResponse.message, "Invalid utm_source");
  });
});
