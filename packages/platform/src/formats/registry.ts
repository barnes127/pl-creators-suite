import type {
  FormatAdapter,
  FormatDirection,
} from "./types";

function normalizeExtension(
  extension: string,
): string {
  const value =
    extension
      .trim()
      .toLowerCase();

  if (
    !value
  ) {
    throw new Error(
      "Format extension cannot be empty",
    );
  }

  return value.startsWith(
    ".",
  )
    ? value
    : `.${value}`;
}

function supportsDirection(
  adapterDirection:
    FormatDirection,
  requestedDirection:
    FormatDirection,
): boolean {
  if (
    requestedDirection ===
    "both"
  ) {
    return (
      adapterDirection ===
      "both"
    );
  }

  return (
    adapterDirection ===
      "both" ||
    adapterDirection ===
      requestedDirection
  );
}

export class FormatAdapterRegistry {
  private readonly adapters =
    new Map<
      string,
      FormatAdapter
    >();

  register(
    adapter: FormatAdapter,
  ): void {
    const id =
      adapter.descriptor.id.trim();

    if (
      !id
    ) {
      throw new Error(
        "Format adapter id is required",
      );
    }

    if (
      this.adapters.has(
        id,
      )
    ) {
      throw new Error(
        `Format adapter already registered: ${id}`,
      );
    }

    if (
      adapter.descriptor
        .extensions.length ===
      0
    ) {
      throw new Error(
        `Format adapter must declare at least one extension: ${id}`,
      );
    }

    this.adapters.set(
      id,
      adapter,
    );
  }

  unregister(
    id: string,
  ): boolean {
    return this.adapters.delete(
      id,
    );
  }

  get(
    id: string,
  ): FormatAdapter | null {
    return (
      this.adapters.get(
        id,
      ) ??
      null
    );
  }

  list(): readonly FormatAdapter[] {
    return [
      ...this.adapters.values(),
    ];
  }

  findByExtension(
    extension: string,
    direction?: FormatDirection,
  ): readonly FormatAdapter[] {
    const normalized =
      normalizeExtension(
        extension,
      );

    return this
      .list()
      .filter(
        (
          adapter,
        ) => {
          const extensionMatch =
            adapter.descriptor
              .extensions
              .some(
                (
                  candidate,
                ) =>
                  normalizeExtension(
                    candidate,
                  ) ===
                  normalized,
              );

          if (
            !extensionMatch
          ) {
            return false;
          }

          if (
            !direction
          ) {
            return true;
          }

          return supportsDirection(
            adapter.descriptor
              .direction,
            direction,
          );
        },
      );
  }

  findForPath(
    filePath: string,
    direction?: FormatDirection,
  ): readonly FormatAdapter[] {
    const normalizedPath =
      filePath.toLowerCase();

    return this
      .list()
      .filter(
        (
          adapter,
        ) => {
          const extensionMatch =
            adapter.descriptor
              .extensions
              .some(
                (
                  extension,
                ) =>
                  normalizedPath.endsWith(
                    normalizeExtension(
                      extension,
                    ),
                  ),
              );

          if (
            !extensionMatch
          ) {
            return false;
          }

          if (
            !direction
          ) {
            return true;
          }

          return supportsDirection(
            adapter.descriptor
              .direction,
            direction,
          );
        },
      );
  }
}
