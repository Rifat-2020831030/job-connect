import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { escapeRegex } from "../src/controller/job-controller/shared.js";
import { trackerSuggestionsSchema } from "../src/utils/validators.js";
import { getTrackerSuggestions } from "../src/controller/tracker-controller.js";

describe("tracker suggestions validation & helpers", () => {
  test("validates field as title or company", () => {
    const validTitle = trackerSuggestionsSchema.safeParse({
      params: { id: "507f1f77bcf86cd799439011" },
      query: { field: "title", q: "react" },
    });
    assert.strictEqual(validTitle.success, true);

    const validCompany = trackerSuggestionsSchema.safeParse({
      params: { id: "507f1f77bcf86cd799439011" },
      query: { field: "company", q: "google" },
    });
    assert.strictEqual(validCompany.success, true);

    const invalidField = trackerSuggestionsSchema.safeParse({
      params: { id: "507f1f77bcf86cd799439011" },
      query: { field: "invalid", q: "test" },
    });
    assert.strictEqual(invalidField.success, false);
  });

  test("escapes regex characters safely", () => {
    assert.strictEqual(
      escapeRegex("C++ Engineer (Senior)"),
      "C\\+\\+ Engineer \\(Senior\\)"
    );
    assert.strictEqual(
      escapeRegex("A&T Systems [HQ]"),
      "A&T Systems \\[HQ\\]"
    );
  });

  test("returns empty data array immediately if q is empty or whitespace", async () => {
    const req = { query: { field: "title", q: "   " }, params: { id: "507f1f77bcf86cd799439011" } };
    let responseStatus = null;
    let responseJson = null;
    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseJson = data;
        return this;
      },
    };

    await getTrackerSuggestions(req, res);
    assert.strictEqual(responseStatus, 200);
    assert.deepStrictEqual(responseJson, { status: 1, data: [] });
  });
});
