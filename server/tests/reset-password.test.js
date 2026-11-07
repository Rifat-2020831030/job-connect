import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { resetPasswordSchema } from "../src/utils/validators.js";
import { issueTokens } from "../src/controller/auth-controller/shared.js";

process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test_jwt_secret_32_characters_long_12345";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "test_refresh_secret_32_characters_long_12345";

let mockUser = null;
let updateCall = null;

const mockCollection = {
  findOne: async (filter) => {
    if (mockUser && mockUser.email === filter.email) {
      return mockUser;
    }
    return null;
  },
  updateOne: async (filter, update) => {
    updateCall = { filter, update };
    if (filter["otp.exp"] && filter["otp.exp"].$gte) {
      if (mockUser.otp.exp < filter["otp.exp"].$gte) {
        return { matchedCount: 0 };
      }
    }
    return { matchedCount: 1 };
  },
};

globalThis._mongoClientPromise = Promise.resolve({
  db: () => ({
    collection: () => mockCollection,
  }),
});

const { resetPassword } = await import(
  "../src/controller/auth-controller/reset-password.js"
);

function createMockReqRes(body) {
  const req = { body };
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
    getStatusCode: () => statusCode,
    getJsonResponse: () => jsonResponse,
  };

  return { req, res };
}

describe("reset-password schema & token issue", () => {
  test("validates reset password schema correctly", () => {
    const valid = resetPasswordSchema.safeParse({
      body: {
        email: "test@example.com",
        code: "123456",
        password: "newSecurePassword123",
      },
    });
    assert.strictEqual(valid.success, true);

    const invalidShortPass = resetPasswordSchema.safeParse({
      body: {
        email: "test@example.com",
        code: "123456",
        password: "short",
      },
    });
    assert.strictEqual(invalidShortPass.success, false);
  });

  test("issueTokens generates accessToken and refreshToken", () => {
    const tokens = issueTokens("507f1f77bcf86cd799439011", "test@example.com");
    assert.ok(tokens.accessToken, "accessToken should exist");
    assert.ok(tokens.refreshToken, "refreshToken should exist");
  });
});

describe("resetPassword controller behavior", () => {
  test("rejects when account not found", async () => {
    mockUser = null;
    const { req, res } = createMockReqRes({
      email: "unknown@example.com",
      code: "123456",
      password: "newSecurePassword123",
    });

    await resetPassword(req, res);
    assert.strictEqual(res.getStatusCode(), 400);
    assert.strictEqual(res.getJsonResponse().status, 0);
  });

  test("rejects invalid reset code", async () => {
    mockUser = {
      _id: "507f1f77bcf86cd799439011",
      email: "test@example.com",
      otp: { code: "654321", exp: Date.now() + 60000 },
    };
    const { req, res } = createMockReqRes({
      email: "test@example.com",
      code: "123456",
      password: "newSecurePassword123",
    });

    await resetPassword(req, res);
    assert.strictEqual(res.getStatusCode(), 400);
    assert.strictEqual(res.getJsonResponse().message, "Invalid reset code");
  });

  test("rejects expired reset code", async () => {
    mockUser = {
      _id: "507f1f77bcf86cd799439011",
      email: "test@example.com",
      otp: { code: "123456", exp: Date.now() - 5000 },
    };
    const { req, res } = createMockReqRes({
      email: "test@example.com",
      code: "123456",
      password: "newSecurePassword123",
    });

    await resetPassword(req, res);
    assert.strictEqual(res.getStatusCode(), 400);
    assert.strictEqual(res.getJsonResponse().message, "Reset code has expired");
  });

  test("succeeds with valid code and returns tokens", async () => {
    mockUser = {
      _id: "507f1f77bcf86cd799439011",
      email: "test@example.com",
      otp: { code: "123456", exp: Date.now() + 60000 },
    };
    const { req, res } = createMockReqRes({
      email: "test@example.com",
      code: "123456",
      password: "newSecurePassword123",
    });

    await resetPassword(req, res);
    assert.strictEqual(res.getStatusCode(), 200);
    const json = res.getJsonResponse();
    assert.strictEqual(json.status, 1);
    assert.ok(json.data.accessToken);
    assert.ok(json.data.refreshToken);
    assert.strictEqual(json.data.email, "test@example.com");
  });
});
