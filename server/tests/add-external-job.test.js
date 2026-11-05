import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { addTrackedJobSchema } from "../src/utils/validators.js";

describe("addTrackedJobSchema validation", () => {
  test("allows external job without deadline", () => {
    const payload = {
      params: { id: "507f1f77bcf86cd799439011" },
      body: {
        type: "EXTERNAL",
        url: "https://example.com/careers/456",
        title: "Frontend Engineer",
        company: "Acme Corp",
        platform: "LinkedIn",
        notes: "Applied via referral",
      },
    };
    const result = addTrackedJobSchema.safeParse(payload);
    assert.strictEqual(result.success, true);
  });

  test("allows external job with null deadline", () => {
    const payload = {
      params: { id: "507f1f77bcf86cd799439011" },
      body: {
        type: "EXTERNAL",
        url: "https://example.com/careers/456",
        title: "Frontend Engineer",
        company: "Acme Corp",
        platform: "LinkedIn",
        deadline: null,
      },
    };
    const result = addTrackedJobSchema.safeParse(payload);
    assert.strictEqual(result.success, true);
  });
});
