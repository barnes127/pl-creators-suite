import {
  Panel,
} from "../pl-ui";

import type {
  CodeFileInfo,
} from "../../types/app";


export type CodeWorkspaceProps = {
  projectRoot: string;

  codeFiles: CodeFileInfo[];
  newCodeFileName: string;
  activeCodeFileName: string;
  activeCodeLanguage: string;
  codeContent: string;
  codeDirty: boolean;

  setNewCodeFileName:
    (value: string) => void;

  setCodeContent:
    (value: string) => void;

  setCodeDirty:
    (value: boolean) => void;

  onCreateCodeFile:
    () => void | Promise<void>;

  onOpenCodeFile:
    (name: string) =>
      void | Promise<void>;

  onSaveCodeFile:
    () => void | Promise<void>;

  onCloseCodeFile:
    () => void;
};


export function CodeWorkspace({
  projectRoot,
  codeFiles,
  newCodeFileName,
  activeCodeFileName,
  activeCodeLanguage,
  codeContent,
  codeDirty,
  setNewCodeFileName,
  setCodeContent,
  setCodeDirty,
  onCreateCodeFile,
  onOpenCodeFile,
  onSaveCodeFile,
  onCloseCodeFile,
}: CodeWorkspaceProps) {
  return (
    <div className="workspaceSplit">
      <aside className="workspaceSplitSide">
        <Panel title="Code Files">
          {!projectRoot && (
            <div className="emptyState">Open a project to use Code IDE.</div>
          )}

          {projectRoot && (
            <>
              <input
                className="input"
                value={newCodeFileName}
                onChange={(e) => setNewCodeFileName(e.target.value)}
                placeholder="main.py"
              />

              <button
                className="btn btn-primary"
                type="button"
                onClick={() => void onCreateCodeFile()}
              >
                Create
              </button>

              <div style={{ marginTop: 12 }}>
                {codeFiles.length === 0 ? (
                  <div className="emptyState">No code files yet</div>
                ) : (
                  codeFiles.map((file) => (
                    <button
                      key={file.name}
                      className={`listNutton ${
                        activeCodeFileName === file.name ? "listButtonActive" : ""
                      }`}
                      type="button"
                      onClick={() => void onOpenCodeFile(file.name)}
                    >
                      <strong>
                        {file.name}
                        {activeCodeFileName === file.name ? " ✓" : ""}
                      </strong>
                      <span className="listButtonMeta">{file.language}</span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </Panel>
      </aside>

      <section className="workspaceSplitMain">
        <Panel
          title={
            activeCodeFileName
              ? `${activeCodeFileName}${codeDirty ? " *" : ""}`
              : "No code file selected"
          }
        >
          {activeCodeFileName ? (
            <>
              <div className="codeMeta">
                <span>{activeCodeLanguage || "Plain Text"}</span>
                <span className={codeDirty ? "docsDirty" : "docsSaved"}>
                  {codeDirty ? "Unsaved changes" : "Saved"}
                </span>
              </div>

              <textarea
                className="codeEditor"
                value={codeContent}
                onChange={(e) => {
                  setCodeContent(e.target.value);
                  setCodeDirty(true);
                }}
                spellCheck={false}
              />

              <div className="docsEditorActions">
                <button
                  className="btn btn-subtle"
                  type="button"
                  onClick={() => onCloseCodeFile()}
                >
                  Close File
                </button>

                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => void onSaveCodeFile()}
                >
                  Save File
                </button>
              </div>
            </>
          ) : (
            <div className="emptyState">
              No code file open. Create a new file from the sidebar or open an existing project file to start
            </div>
          )}
        </Panel>
      </section>
    </div>
  );
}
