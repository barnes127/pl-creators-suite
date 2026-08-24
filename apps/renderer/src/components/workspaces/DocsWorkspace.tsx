import {
  Panel,
} from "../pl-ui";

import type {
  DocInfo,
} from "../../types/app";


export type DocsWorkspaceProps = {
  projectRoot: string;

  docsList: DocInfo[];

  newDocName: string;

  activeDocName: string;

  docContent: string;

  docDirty: boolean;

  setNewDocName:
    (value: string) =>
      void;

  setDocContent:
    (value: string) =>
      void;

  setDocDirty:
    (value: boolean) =>
      void;

  onCreateDoc:
    () =>
      void | Promise<void>;

  onOpenDoc:
    (name: string) =>
      void | Promise<void>;

  onSaveDoc:
    () =>
      void | Promise<void>;

  onCloseDoc:
    () => void;
};


export function DocsWorkspace({
  projectRoot,
  docsList,
  newDocName,
  activeDocName,
  docContent,
  docDirty,
  setNewDocName,
  setDocContent,
  setDocDirty,
  onCreateDoc,
  onOpenDoc,
  onSaveDoc,
  onCloseDoc,
}: DocsWorkspaceProps) {
  return (
    <div className="workspaceSplit">
      <aside className="workspaceSplitSide">
        <Panel title="Document Library">
          {!projectRoot && <div className="emptyState">Open a project to use Docs.</div>}

          {projectRoot && (
            <>
              <input
                className="input"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="new-doc.md"
              />

              <button className="btn btn-primary" type="button" onClick={() => void onCreateDoc()}>
                New Document
              </button>

              <div style={{ marginTop: 12 }}>
                {docsList.length === 0 ? (
                  <div className="emptyState">No documents yet</div>
                ) : (
                  docsList.map((doc) => (
                    <button
                      key={doc.name}
                      className={`listButton ${
                        activeDocName === doc.name ? "ListButtonActive" : ""
                      }`}
                      type="button"
                      onClick={() => void onOpenDoc(doc.name)}
                    >
                      <strong>
                        {doc.name}
                        {activeDocName === doc.name ? " ✓" : ""}
                      </strong>
                      <span className="listButtonMeta">Document</span>
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
            activeDocName
              ? `${activeDocName}${docDirty ? " *" : ""}`
              : "No document selected"
          }
        >
          {activeDocName ? (
            <>
              <textarea
                className="docsEditor"
                value={docContent}
                onChange={(e) => {
                  setDocContent(e.target.value);
                  setDocDirty(true);
                }}
                spellCheck={true}
              />

              <div className="docsEditorActions">

                <button
                  className="btn btn-subtle"
                  type="button"
                  onClick={() => onCloseDoc()}
                >
                  Close Document
                </button>

                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => void onSaveDoc()}
                >
                  Save Document
                </button>
              </div>
            </>
          ) : (
            <div className="emptyState">
              No document open. Create a new document from the sidebar or open an existing one to start
            </div>
          )}
        </Panel>
      </section>
    </div>
  );
}
