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

type TokenType =
  | "number"
  | "identifier"
  | "plus"
  | "minus"
  | "star"
  | "slash"
  | "leftParen"
  | "rightParen"
  | "eof";

type Token = {
  type: TokenType;
  value: string;
  position: number;
};

type ParserState = {
  tokens: Token[];
  index: number;
  variables: ExpressionVariables;
};

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < expression.length) {
    const char = expression[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      const start = index;
      let hasDot = char === ".";

      index += 1;

      while (index < expression.length) {
        const next = expression[index];

        if (next === ".") {
          if (hasDot) {
            throw new Error(`Invalid number at position ${index}`);
          }

          hasDot = true;
          index += 1;
          continue;
        }

        if (!/[0-9]/.test(next)) break;

        index += 1;
      }

      const value = expression.slice(start, index);

      if (value === "." || !Number.isFinite(Number(value))) {
        throw new Error(`Invalid number at position ${start}`);
      }

      tokens.push({
        type: "number",
        value,
        position: start,
      });

      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      const start = index;

      index += 1;

      while (index < expression.length && /[A-Za-z0-9_]/.test(expression[index])) {
        index += 1;
      }

      tokens.push({
        type: "identifier",
        value: expression.slice(start, index),
        position: start,
      });

      continue;
    }

    const tokenMap: Record<string, TokenType> = {
      "+": "plus",
      "-": "minus",
      "*": "star",
      "/": "slash",
      "(": "leftParen",
      ")": "rightParen",
    };

    const tokenType = tokenMap[char];

    if (!tokenType) {
      throw new Error(`Unsupported character "${char}" at position ${index}`);
    }

    tokens.push({
      type: tokenType,
      value: char,
      position: index,
    });

    index += 1;
  }

  tokens.push({
    type: "eof",
    value: "",
    position: expression.length,
  });

  return tokens;
}

function currentToken(state: ParserState): Token {
  return state.tokens[state.index];
}

function consumeToken(state: ParserState, type: TokenType): Token {
  const token = currentToken(state);

  if (token.type !== type) {
    throw new Error(
      `Expected ${type} at position ${token.position}, found ${token.type}`
    );
  }

  state.index += 1;
  return token;
}

function matchToken(state: ParserState, type: TokenType): boolean {
  if (currentToken(state).type !== type) return false;

  state.index += 1;
  return true;
}

function parseExpression(state: ParserState): number {
  return parseAddition(state);
}

function parseAddition(state: ParserState): number {
  let value = parseMultiplication(state);

  while (true) {
    if (matchToken(state, "plus")) {
      value += parseMultiplication(state);
      continue;
    }

    if (matchToken(state, "minus")) {
      value -= parseMultiplication(state);
      continue;
    }

    break;
  }

  return value;
}

function parseMultiplication(state: ParserState): number {
  let value = parseUnary(state);

  while (true) {
    if (matchToken(state, "star")) {
      value *= parseUnary(state);
      continue;
    }

    if (matchToken(state, "slash")) {
      const divisor = parseUnary(state);

      if (divisor === 0) {
        throw new Error("Division by zero");
      }

      value /= divisor;
      continue;
    }

    break;
  }

  return value;
}

function parseUnary(state: ParserState): number {
  if (matchToken(state, "plus")) {
    return parseUnary(state);
  }

  if (matchToken(state, "minus")) {
    return -parseUnary(state);
  }

  return parsePrimary(state);
}

function parsePrimary(state: ParserState): number {
  const token = currentToken(state);

  if (token.type === "number") {
    consumeToken(state, "number");
    return Number(token.value);
  }

  if (token.type === "identifier") {
    consumeToken(state, "identifier");

    if (!(token.value in state.variables)) {
      throw new Error(`Unknown variable "${token.value}"`);
    }

    const value = state.variables[token.value];

    if (!Number.isFinite(value)) {
      throw new Error(`Variable "${token.value}" is not finite`);
    }

    return value;
  }

  if (matchToken(state, "leftParen")) {
    const value = parseExpression(state);
    consumeToken(state, "rightParen");
    return value;
  }

  throw new Error(`Unexpected token "${token.value}" at position ${token.position}`);
}

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

  try {
    const tokens = tokenize(clean);

    const state: ParserState = {
      tokens,
      index: 0,
      variables,
    };

    const value = parseExpression(state);
    consumeToken(state, "eof");

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
