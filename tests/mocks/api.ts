import { z } from "zod";

import { Api, Method } from "../../mod.ts";

export const api = new Api();

api.register(
  new Method({
    method: "foo",
    description: "Fetches a foo value with the provided bar.",
    params: z.object({
      bar: z.string(),
    }),
    output: z.string(),
    handler: async ({ params: { bar } }) => {
      return bar;
    },
  }),
);
