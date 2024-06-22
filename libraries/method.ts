import type { RpcError } from "@valkyr/json-rpc";
import type { z, ZodArray, ZodTypeAny } from "zod";

import type { Action, RequestContext } from "./action.ts";

/*
 |--------------------------------------------------------------------------------
 | Method
 |--------------------------------------------------------------------------------
 |
 | A simple passthrough wrapper constructing a method object that can be consumed
 | by the API server. It provides the handler with the type context resulting from
 | the optional params and actions provided.
 |
 */

export class Method<
  TContext extends RequestContext = RequestContext,
  Actions extends Action<any>[] = any,
  Params extends ZodMethodType = ZodMethodType,
  Output extends ZodMethodType | undefined = any,
> {
  readonly method: string;
  readonly description: string;
  readonly actions: Actions;
  readonly params: ZodTypeAny;
  readonly output?: Output;
  readonly handler: MethodHandler<TContext, Actions, Params, Output>;

  constructor(options: MethodOptions<TContext, Actions, Params, Output>) {
    this.method = options.method;
    this.description = options.description;
    this.actions = options.actions ?? ([] as unknown as Actions);
    this.params = options.params;
    this.output = options.output;
    this.handler = options.handler;
  }
}

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type AnyMethod = Method<any, any, any>;

export type MethodOptions<
  TContext extends RequestContext = RequestContext,
  Actions extends Action<any>[] = [],
  Params extends ZodMethodType = ZodMethodType,
  Output extends ZodMethodType | undefined = any,
> = {
  /**
   * Name of the method used to identify the JSON-RPC 2.0 handler to execute.
   */
  method: string;

  /**
   * Describes the intent of the methods behavior used by client genreation
   * tools to document the function output.
   */
  description: string;

  /**
   * A list of methods to execute before the request is passed to the method
   * handler. This can be used to perform a wide variety of tasks.
   *
   * @example
   *
   * new Method({ method: "Users.Create", actions: [isAuthenticated] });
   */
  actions?: Actions;

  /**
   * The params of the request using Zod validation and casting before passing
   * it to the method handler context under the JSON-RPC 2.0 `params` key.
   *
   * @example
   *
   * import { Method } from "@valkyr/api";
   *
   * new Method({
   *   method: "Users.Create",
   *   params: {
   *     name: z.string().min(1).max(255),
   *     age: z.number().int().positive(),
   *   },
   *   handler: async ({ body }) => {
   *     return { name: body.name, age: body.age };
   *   }
   * });
   */
  params: Params;

  /**
   * Response output produced by the method handler.
   */
  output?: Output;

  /**
   * Route handler which will be executed when the method is triggered.
   *
   * @example
   *
   * new Route({
   *   method: "Users.Create",
   *   params: z.string().min(1).max(255),
   *   handler: async ({ body }) => {
   *     return `Hello, ${body.name}!`;
   *   }
   * });
   */
  handler: MethodHandler<TContext, Actions, Params, Output>;
};

type MethodHandler<
  TContext extends RequestContext = RequestContext,
  Actions extends Action<any>[] = [],
  Params extends ZodMethodType = ZodMethodType,
  Output extends ZodMethodType | undefined = any,
> = (
  context:
    & TContext
    & { params: z.infer<Params> }
    & (Actions extends [] ? object
      : {
        [K in keyof Actions]: Actions[K] extends Action<infer P> ? P : never;
      }[number]),
) => Output extends ZodMethodType ? Promise<z.infer<Output> | RpcError>
  : Promise<RpcError | void>;

type ZodMethodType = ZodTypeAny | ZodArray<ZodTypeAny>;
