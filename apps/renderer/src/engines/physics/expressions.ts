export type ExpressionVariables = Record<string, number>;

export type ExpressionResult =
  | {
      ok: true;
      value: number;
      expression: string;
    }
  | {
      ok: false;
      error: string;
      expression: string;
    };

const allowedExpressionPattern = /^[0-9+\-*/().\sA-Za-z_]+$/;

export function evaluateNumericExpression(
  expression: string,
  variables: ExpressionVariables = {}
): ExpressionResult {
  const clean = String(expression || "").trim();

  if (!clean) {
    return {
      ok: false,
      error: "Expression is required",
      expression,
    };
  }

  if (!allowedExpressionPattern.test(clean)) {
    return {
      ok: false,
      error: "Expression contains unsupported characters",
      expression,
    };
  }

  const variableNames = Object.keys(variables);
  const variableValues = variableNames.map((name) => variables[name]);

  try {
    const fn = new Function(
      ...variableNames,
      `"use strict"; return (${clean});`
    ) as (...args: number[]) => number;

    const value = fn(...variableValues);

    if (!Number.isFinite(value)) {
      return {
        ok: false,
        error: "Expression did not produce a finite number",
        expression,
      };
    }

    return {
      ok: true,
      value,
      expression,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      expression,
    };
  }
}
