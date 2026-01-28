# Project Format (v1)

## Project Root Folder
A project is a folder containing at minimum:

- pl-project.json (required)
- logs/ (optional, but created by default)
- assets/ (future)
- data/ (future)

Example:
MyProject/
  pl-project.json
  logs/
    session.log

## Manifest: pl-project.json
Required fields:
- schemaVersion (number)
- name (string)
- createdAt (ISO string)
- updatedAt (ISO string)

## Portable Project File: .plproj
A .plproj file is a ZIP archive of the project root folder.

Rules:
- Must include pl-project.json at archive root.
- Archive root contents unpack into a new project folder.
- On import:
  - validate manifest
  - sanitize folder name
  - do not overwrite existing folder
  - add to recents
  - return imported projectRoot
