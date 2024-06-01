import { assertEquals } from "std/assert/mod.ts";
import { it } from "std/testing/bdd.ts";

import { api } from "./mocks/api.ts";

it("should succesfully resolve a request", async () => {
  const response: any = await api.handle({ jsonrpc: "2.0", method: "foo", params: { bar: "foo" }, id: 1 }, {});
  assertEquals(response.result, "foo");
});

it("should throw an error when method does not exist", async () => {
  const response: any = await api.handle({ jsonrpc: "2.0", method: "bar", id: 1 }, {});
  assertEquals(response.error.message, "Method not found");
});
