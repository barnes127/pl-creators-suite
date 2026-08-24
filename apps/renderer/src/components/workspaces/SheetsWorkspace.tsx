import {
  Panel,
} from "../pl-ui";

import type {
  SheetData,
  SheetInfo,
} from "../../types/app";


export type SheetsWorkspaceProps = {
  projectRoot: string;

  sheetsList: SheetInfo[];
  newSheetName: string;
  activeSheetName: string;
  sheetData: SheetData | null;
  sheetDirty: boolean;

  setNewSheetName:
    (value: string) => void;

  onCreateSheet:
    () => void | Promise<void>;

  onOpenSheet:
    (name: string) =>
      void | Promise<void>;

  onSaveSheet:
    () => void | Promise<void>;

  onCloseSheet:
    () => void;

  onUpdateSheetCell:
    (
      rowIndex: number,
      columnIndex: number,
      value: string,
    ) => void;

  onAddSheetRow:
    () => void;

  onAddSheetColumn:
    () => void;

  onDeleteLastSheetRow:
    () => void;

  onDeleteLastSheetColumn:
    () => void;
};


export function SheetsWorkspace({
  projectRoot,
  sheetsList,
  newSheetName,
  activeSheetName,
  sheetData,
  sheetDirty,
  setNewSheetName,
  onCreateSheet,
  onOpenSheet,
  onSaveSheet,
  onCloseSheet,
  onUpdateSheetCell,
  onAddSheetRow,
  onAddSheetColumn,
  onDeleteLastSheetRow,
  onDeleteLastSheetColumn,
}: SheetsWorkspaceProps) {
  return (
    <div className="workspaceSplit">
      <aside className="workspaceSplitSide">
        <Panel title="Sheet Library">
          {!projectRoot && (
            <div className="emptyState">Open a project to use Sheets.</div>
          )}

          {projectRoot && (
            <>
              <input
                className="input"
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
                placeholder="budget"
              />

              <button
                className="btn btn-primary"
                type="button"
                onClick={() => void onCreateSheet()}
              >
                New Sheet
              </button>

              <div style={{ marginTop: 12 }}>
                {sheetsList.length === 0 ? (
                  <div className="emptyState">No sheets yet</div>
                ) : (
                  sheetsList.map((sheet) => (
                    <button
                      key={sheet.name}
                      className={`listButton ${
                        activeSheetName === sheet.name ? "listButtonActive" : ""
                      }`}
                      type="button"
                      onClick={() => void onOpenSheet(sheet.name)}
                    >
                      <strong>
                        {sheet.name}
                        {activeSheetName === sheet.name ? " ✓" : ""}
                      </strong>
                      <span className="listButtonMeta">Spreadsheet</span>
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
            activeSheetName
              ? `${activeSheetName}${sheetDirty ? " *" : ""}`
              : "No sheet selected"
            }
          >
            {activeSheetName && sheetData ? (
            <>
              <div className="sheetMeta">
                <span>
                  {sheetData.rows} rows × {sheetData.columns} columns
                </span>

                <span className={sheetDirty ? "docsDirty" : "docsSaved"}>
                  {sheetDirty ? "Unsaved changes" : "Saved"}
                </span>
              </div>

              <div className="sheetToolbar">
                <button
                  className="btn btn-subtle"
                  type="button"
                  onClick={() => onAddSheetRow()}
                >
                  Add Row
                </button>

                <button
                  className="btn btn-subtle"
                  type="button"
                  onClick={() => onAddSheetColumn()}
                >
                  Add Column
                </button>

                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={() => onDeleteLastSheetRow()}
                >
                  Delete Last Row
                </button>

                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={() => onDeleteLastSheetColumn()}
                >
                  Delete Last Column
                </button>
              </div>

              <div className="sheetGridWrap">
                <table className="sheetGrid">
                  <thead>
                    <tr>
                      <th></th>
                      {Array.from({ length: sheetData.columns }, (_, columnIndex) => (
                        <th key={columnIndex}>
                          {String.fromCharCode(65 + columnIndex)}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {sheetData.cells.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <th>{rowIndex + 1}</th>

                        {row.map((cell, columnIndex) => (
                         <td key={columnIndex}>
                           <input
                             className="sheetCell"
                              value={cell}
                              onChange={(e) =>
                                onUpdateSheetCell(
                                  rowIndex,
                                  columnIndex,
                                  e.target.value
                                )
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="docsEditorActions">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => onCloseSheet()}
               >
                  Close Sheet
                </button>

                <button
                  className="btn"
                  type="button"
                  onClick={() => void onSaveSheet()}
                >
                  Save Sheet
                </button>
              </div>
            </>
          ) : (
            <div className="emptyState">
              No sheet open. Create a new sheet from the sidebar or open an existing spreadsheet to start editing cells
            </div>
          )}
        </Panel>
      </section>
    </div>
  );
}
