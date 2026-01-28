# Wave 4 RPC Additions

## project.export
Input:
- projectRoot (string)
- outPath? (string)

Output:
- outPath (string)

Behavior:
- validates pl-project.json exists
- zips projectRoot into outPath (.plproj)

## project.import
Input:
- filePath (string)  // .plproj
- baseDir? (string)

Output:
- projectRoot (string)
- manifest (object)

Behavior:
- unzips archive into baseDir/<sanitizedName>
- validates pl-project.json
- adds to recents
- returns imported projectRoot
