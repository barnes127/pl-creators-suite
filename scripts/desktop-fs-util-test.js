const assert =
  require(
    "assert",
  );

const fs =
  require(
    "fs/promises",
  );

const os =
  require(
    "os",
  );

const path =
  require(
    "path",
  );

const {
  writeJsonFileAtomic,
} =
  require(
    "../apps/desktop/util/fs",
  );


async function main() {
  const root =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "pl-fs-util-",
      ),
    );

  const target =
    path.join(
      root,
      "state.json",
    );

  try {
    await writeJsonFileAtomic(
      target,
      {
        value: 1,
      },
    );

    const first =
      JSON.parse(
        await fs.readFile(
          target,
          "utf8",
        ),
      );

    assert.deepStrictEqual(
      first,
      {
        value: 1,
      },
    );

    await Promise.all([
      writeJsonFileAtomic(
        target,
        {
          value: 2,
        },
      ),
      writeJsonFileAtomic(
        target,
        {
          value: 3,
        },
      ),
    ]);

    const final =
      JSON.parse(
        await fs.readFile(
          target,
          "utf8",
        ),
      );

    assert.ok(
      final.value === 2 ||
      final.value === 3,
    );

    const entries =
      await fs.readdir(
        root,
      );

    assert.deepStrictEqual(
      entries,
      [
        "state.json",
      ],
    );

    console.log(
      "PASS    atomic JSON write creates valid data",
    );

    console.log(
      "PASS    concurrent writes avoid temp-file collision",
    );

    console.log(
      "PASS    temporary files are cleaned up",
    );
  } finally {
    await fs.rm(
      root,
      {
        recursive: true,
        force: true,
      },
    );
  }
}


main().catch(
  (
    error,
  ) => {
    console.error(
      error,
    );

    process.exitCode =
      1;
  },
);
