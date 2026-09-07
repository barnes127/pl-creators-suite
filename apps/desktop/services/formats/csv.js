function parseCsv(
  text,
  options = {},
) {
  const delimiter =
    options.delimiter || ",";

  if (delimiter.length !== 1) {
    throw new Error(
      "CSV delimiter must be one character",
    );
  }

  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (
    let index = 0;
    index < text.length;
    index += 1
  ) {
    const character =
      text[index];

    if (quoted) {
      if (character === "\"") {
        if (
          text[index + 1] === "\""
        ) {
          field += "\"";
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += character;
      }

      continue;
    }

    if (character === "\"") {
      quoted = true;
      continue;
    }

    if (character === delimiter) {
      row.push(field);
      field = "";
      continue;
    }

    if (
      character === "\n" ||
      character === "\r"
    ) {
      if (
        character === "\r" &&
        text[index + 1] === "\n"
      ) {
        index += 1;
      }

      row.push(field);
      rows.push(row);

      row = [];
      field = "";
      continue;
    }

    field += character;
  }

  if (quoted) {
    const error =
      new Error(
        "CSV contains an unterminated quoted field",
      );

    error.code =
      "INVALID_CSV";

    throw error;
  }

  if (
    field.length > 0 ||
    row.length > 0
  ) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function escapeCsvField(
  value,
  delimiter,
) {
  const stringValue =
    value == null
      ? ""
      : String(value);

  if (
    stringValue.includes("\"") ||
    stringValue.includes("\n") ||
    stringValue.includes("\r") ||
    stringValue.includes(delimiter)
  ) {
    return `"${stringValue.replace(
      /"/g,
      "\"\"",
    )}"`;
  }

  return stringValue;
}

function serializeCsv(
  rows,
  options = {},
) {
  const delimiter =
    options.delimiter || ",";

  if (delimiter.length !== 1) {
    throw new Error(
      "CSV delimiter must be one character",
    );
  }

  if (!Array.isArray(rows)) {
    throw new Error(
      "CSV rows must be an array",
    );
  }

  return rows
    .map((row) => {
      if (!Array.isArray(row)) {
        throw new Error(
          "Each CSV row must be an array",
        );
      }

      return row
        .map((value) =>
          escapeCsvField(
            value,
            delimiter,
          ),
        )
        .join(delimiter);
    })
    .join("\n");
}

module.exports = {
  parseCsv,
  serializeCsv,
  escapeCsvField,
};
