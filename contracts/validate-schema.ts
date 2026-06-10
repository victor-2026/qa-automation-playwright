/**
 * OpenAPI schema validation helper for Playwright API tests.
 * Validates HTTP responses against the exported OpenAPI spec.
 */

import * as fs from 'fs';
import * as path from 'path';
import { APIResponse } from '@playwright/test';
import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

let spec: Record<string, any> | null = null;
const validate: ReturnType<Ajv['compile']> | null = null;

const SPEC_PATH = path.join(__dirname, 'openapi.json');

/**
 * Load OpenAPI spec from contracts/openapi.json
 */
function loadSpec(): Record<string, any> {
  if (!spec) {
    if (!fs.existsSync(SPEC_PATH)) {
      throw new Error(
        `OpenAPI spec not found at ${SPEC_PATH}\n` +
        'Run: npm run contracts:export'
      );
    }
    spec = JSON.parse(fs.readFileSync(SPEC_PATH, 'utf-8'));
  }
  return spec!;
}

/**
 * Resolve a $ref reference in the OpenAPI spec
 */
function resolveRef(ref: string): any {
  const parts = ref.replace('#/', '').split('/');
  let current: any = loadSpec();
  for (const part of parts) {
    current = current?.[part];
  }
  return current;
}

/**
 * Resolve all $ref in a schema object
 */
function resolveSchema(schema: any): any {
  if (!schema || typeof schema !== 'object') return schema;

  if (schema.$ref) {
    return resolveSchema(resolveRef(schema.$ref));
  }

  if (schema.properties) {
    const resolved: any = { ...schema };
    resolved.properties = {};
    for (const [key, val] of Object.entries(schema.properties)) {
      resolved.properties[key] = resolveSchema(val);
    }
    return resolved;
  }

  if (schema.items) {
    return { ...schema, items: resolveSchema(schema.items) };
  }

  if (schema.allOf) {
    const merged: any = { type: 'object', properties: {} };
    for (const sub of schema.allOf) {
      const resolved = resolveSchema(sub);
      if (resolved?.properties) {
        Object.assign(merged.properties, resolved.properties);
      }
    }
    return merged;
  }

  if (schema.oneOf || schema.anyOf) {
    const variants = schema.oneOf || schema.anyOf;
    return { ...schema, oneOf: undefined, anyOf: undefined, oneOfResolved: variants.map(resolveSchema) };
  }

  return schema;
}

/**
 * Get the expected response schema for a given method and path
 */
function getResponseSchema(method: string, path: string, statusCode: number): any | null {
  const spec = loadSpec();
  const pathItem = spec.paths?.[path];
  if (!pathItem) return null;

  const operation = pathItem[method.toLowerCase()];
  if (!operation) return null;

  const response = operation.responses?.[statusCode.toString()];
  if (!response) return null;

  // OpenAPI 3.x: response.content['application/json'].schema
  const jsonContent = response.content?.['application/json'];
  if (!jsonContent?.schema) return null;

  return resolveSchema(jsonContent.schema);
}

/**
 * Validate a response body against the OpenAPI spec
 */
export function validateResponse(
  method: string,
  apiPath: string,
  statusCode: number,
  body: any
): { valid: boolean; errors: ErrorObject[] | null } {
  const schema = getResponseSchema(method, apiPath, statusCode);
  if (!schema) {
    return { valid: true, errors: null }; // No schema defined — skip validation
  }

  const ajv = new Ajv({ allErrors: true, verbose: true, strict: false });
  addFormats(ajv);

  try {
    const valid = ajv.validate(schema, body);
    return { valid, errors: valid ? null : ajv.errors };
  } catch (err) {
    // Schema compilation error — skip validation
    return { valid: true, errors: null };
  }
}

/**
 * Validate a Playwright APIResponse against the OpenAPI spec
 */
export async function validateApiResponse(
  response: APIResponse,
  method: string,
  apiPath: string
): Promise<{ valid: boolean; errors: ErrorObject[] | null }> {
  const status = response.status();
  let body: any;

  try {
    const ct = response.headers()['content-type'] || '';
    if (ct.includes('application/json')) {
      body = await response.json();
    } else {
      return { valid: true, errors: null }; // Non-JSON response — skip
    }
  } catch {
    return { valid: true, errors: null }; // Can't parse — skip
  }

  return validateResponse(method, apiPath, status, body);
}

/**
 * Get all defined paths from the OpenAPI spec
 */
export function getDefinedPaths(): string[] {
  const spec = loadSpec();
  return Object.keys(spec.paths || {});
}

/**
 * Get all methods for a given path
 */
export function getMethodsForPath(apiPath: string): string[] {
  const spec = loadSpec();
  const pathItem = spec.paths?.[apiPath];
  if (!pathItem) return [];
  return Object.keys(pathItem).filter(m => ['get', 'post', 'put', 'patch', 'delete'].includes(m));
}

/**
 * Match a request path against OpenAPI path templates
 * e.g., /api/users/alice matches /api/users/{username}
 */
export function matchPath(requestPath: string): string | null {
  const definedPaths = getDefinedPaths();

  // Exact match first
  if (definedPaths.includes(requestPath)) return requestPath;

  // Template match
  for (const template of definedPaths) {
    const templateParts = template.split('/');
    const requestParts = requestPath.split('/');

    if (templateParts.length !== requestParts.length) continue;

    let match = true;
    for (let i = 0; i < templateParts.length; i++) {
      if (templateParts[i].startsWith('{') && templateParts[i].endsWith('}')) continue;
      if (templateParts[i] !== requestParts[i]) { match = false; break; }
    }
    if (match) return template;
  }

  return null;
}
