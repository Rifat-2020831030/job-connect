import { test, describe } from "node:test";
import assert from "node:assert/strict";
import statRouter from "../src/routers/stat.js";

describe("stat router", () => {
  test("mounts POST /source route", () => {
    const route = statRouter.stack.find(
      (layer) => layer.route && layer.route.path === "/source" && layer.route.methods.post
    );
    assert.ok(route, "POST /source route should be registered on stat router");
  });
});
