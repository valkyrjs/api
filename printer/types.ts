import { pascalCase } from "change-case";
import { printNode, zodToTs } from "zod-to-ts";

import type { Method } from "~libraries/method.ts";
import { getMappedMethods } from "~utilities/methods.ts";

/**
 * Map all methods into their respective module namespaces and export them.
 *
 * @param methods - List of methods to generate types for.
 */
export function resolveNamespacedTypes(methods: Method[]) {
  const types: string[] = [];
  // deno-lint-ignore no-explicit-any
  const map: any = getMappedMethods(methods);
  for (const key in map) {
    types.push(`
      type ${pascalCase(key)} = {
        ${getMethods(map[key])}
      };
    `.trim());
  }
  return types.join("\n\n");
}

// deno-lint-ignore no-explicit-any
function getMethods(map: any): string {
  const result: string[] = [];
  for (const name in map) {
    const value = map[name];
    if (name === "methods") {
      result.push(map[name].map(getRequestTypes).join(",\n\n"));
    } else {
      result.push(addMethod(name, value));
    }
  }
  return result.join(",\n\n");
}

// deno-lint-ignore no-explicit-any
function addMethod(name: string, map: any): string {
  return `${pascalCase(name)}: {
    ${getMethods(map)}
  }`.trim();
}

/**
 * Convert methodr object definitions into typescript types.
 *
 * @param method - Method to covert types from.
 */
function getRequestTypes({ params, output, file }: Method): string {
  const types: string[] = [];
  types.push(`${pascalCase(file)}: {`);
  if (params !== undefined) {
    types.push(`
      ${getTypeJSDoc(params)}
      Params: ${printNode((zodToTs as any)(params).node)}  
    `);
  }
  if (output !== undefined) {
    types.push(`
      ${getTypeJSDoc(output)}
      Response: ${printNode(zodToTs(output).node)}
    `);
  } else {
    types.push(`Response: Promise<void>`);
  }
  types.push("};");
  return types.join("\n\n");
}

function getTypeJSDoc(entity: any): string {
  if (entity.description === undefined) {
    return "";
  }
  const docs: string[] = ["/**"];
  if (entity.description) {
    docs.push(`* ${entity.description}`);
  }
  if (docs.length > 0) {
    docs.push("*/");
    return docs.join("\n");
  }
  return "";
}
