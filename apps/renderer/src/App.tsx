import { useEffect,  useMemo, useState } from "react";
import { rpc } from "./rpc";
import "./app.css";
import { Modal } from "./components/Modal";

declare global {
  interface Window {
    plMenu?: {
      onMenuAction?: (callback: (channel: string) => void) => void | (() => void);
    };
  }
}

type AppId = "code" | "game" | "movie" | "docs" | "sheets" | "modeler";

type PluginInfo = {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  type: string;
  description: string;
};

type NavItem = {
  id: AppId;
  label: string;
  hint: string;
};

export default function App() {
  const navItems: NavItem[] = useMemo(
    () => [
      { id: "code", label: "Code IDE", hint: "Edit + run scripts later" },
      { id: "game", label: "Game Studio", hint: "Scenes + assets later" },
      { id: "movie", label: "Movie Studio", hint: "Timeline + export later" },
      { id: "docs", label: "Docs", hint: "Notes + docs later" },
      { id: "sheets", label: "Sheets", hint: "Grid + formulas later" },
      { id: "modeler", label: "Modeling", hint: "3D + physics later" },
    ],
    []
  );

  const [active, setActive] = useState<AppId>("code");
//  const activeItem = navItems.find((n) => n.id === active)!;
  const [projectRoot, setProjectRoot] = useState<string>("");
  const [status, setStatus] = useState<string>("idle");
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("TestProject");
  const [newBaseDir, setNewBaseDir] = useState("");
  const [uiError, setUiError] = useState("");
  const [recents, setRecents] = useState<Array<{ projectRoot: string; name: string; lastOpenedAt: string }>>([]);
  const [openPath, setOpenPath] = useState("");
  const [openError, setOpenError] = useState("");
  const [showOpen, setShowOpen] = useState(false);
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);


async function handleOpenProject() {
  try {
    setStatus("Choosing project folder...");

    const pick = await rpc<{ canceled: boolean; projectRoot?: string }>(
      "dialog.openProjectFolder"
    );

    if (pick.canceled || !pick.projectRoot) {
      setStatus("Open canceled");
      return;
    }

    setStatus("Opening project...");

    const result = await rpc<{ projectRoot: string; manifestPath: string; manifest: any }>(
      "project.open",
      { projectRoot: pick.projectRoot }
    );

    setProjectRoot(result.projectRoot);
    setStatus(`Opened: ${result.projectRoot}`);
    await refreshRecents();
  } catch (e: any) {
    setStatus(`Error: ${e.message || String(e)}`);
  }
}

async function handleImportProject() {
  try {
    setStatus("Choose .plproj file...");
    const pick = await rpc<{ canceled: boolean; filePath?: string }>("dialog.openPlproj");

    if (pick.canceled || !pick.filePath) {
      setStatus("Import canceled");
      return;
    }

    setStatus("Importing project...");
    const result = await rpc<{ projectRoot: string }>("project.import", {
      filePath: pick.filePath,
    });

    setProjectRoot(result.projectRoot);
    setStatus(`Imported: ${result.projectRoot}`);
    await refreshRecents();
  } catch (e: any) {
    setStatus(`Error: ${e.message || String(e)}`);
  }
}

async function handleExportProject() {
  try {
    if (!projectRoot) return setStatus("No project open");

    const suggestedName = projectRoot.split("/").pop() || "project";

    setStatus("Choose export location...");
    const pick = await rpc<{ canceled: boolean; filePath?: string }>(
      "dialog.savePlproj",
      { defaultName: `${suggestedName}.plproj` }
    );

    if (pick.canceled || !pick.filePath) {
      setStatus("Export canceled");
      return;
    }

    setStatus("Exporting project...");
    const result = await rpc<{ outPath: string }>("project.export", {
      projectRoot,
      outPath: pick.filePath,
    });

    setStatus(`Exported: ${result.outPath}`);
    await refreshRecents();
  } catch (e: any) {
    setStatus(`Error: ${e.message || String(e)}`);
  }
}

function handleNewProject() {
  setUiError("");
  setShowNew(true);
}

async function refreshPlugins() {
  try {
    const result = await rpc<{ plugins: PluginInfo[] }>("plugins.list");
    setPlugins(result.plugins);
  } catch (e: any) {
    setStatus(`Plugin error: ${e.message || String(e)}`);
  }
}

async function refreshRecents() {
  try {
    const result = await rpc<{ items: any[] }>("recent.list");
    setRecents(result.items || []);
  } catch {
    // ignore
  }
}

useEffect(() => {
  refreshRecents();
  void refreshPlugins();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

useEffect(() => {
  const unsubscribe = window.plMenu?.onMenuAction?.((channel) => {
    if (channel === "menu:new-project") {
      handleNewProject();
      return;
    }

    if (channel === "menu:open-project") {
      void handleOpenProject();
      return;
    }

    if (channel === "menu:import-project") {
      void handleImportProject();
      return;
    }

    if (channel === "menu:export-project") {
      void handleExportProject();
    }
  });

  return () => {
    if (typeof unsubscribe === "function") {
      unsubscribe();
    }
  };
}, [projectRoot]);

  return (
  <div className="shell">
    <aside className="sidebar">
      <div className="brand">
        <div className="brandTitle">PL Creators Suite</div>
        <div className="brandSub">v0.0.1 • offline-first</div>
      </div>

      <nav className="nav">
        {navItems.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              className={`navItem ${isActive ? "active" : ""}`}
              onClick={() => setActive(item.id)}
              type="button"
            >
              <div className="navLabel">{item.label}</div>
              <div className="navHint">{item.hint}</div>
            </button>
          );
        })}
      </nav>

      <div className="sidebarFooter">
        <div className="tiny">Project: {projectRoot ? projectRoot : "(none)"}</div>
        <div className="tiny">Recent:</div>

        {recents.length === 0 ? (
          <div className="tiny">(none)</div>
        ) : (
          <div className="recentList">
            {recents.slice(0, 5).map((r) => (
              <button
                key={r.projectRoot}
                className="recentItem"
                type="button"
                onClick={async () => {
                  try {
                    setStatus("Opening project...");
                    const result = await rpc<{ projectRoot: string; manifest: any }>("project.open", {
                      projectRoot: r.projectRoot,
                    });
                    setProjectRoot(result.projectRoot);
                    setStatus(`Opened: ${result.projectRoot}`);
                    await refreshRecents();
                  } catch (e: any) {
                    setStatus(`Error: ${e.message}`);
                  }
                }}
                title={r.projectRoot}
              >
                {r.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panelTitle">Plugins</div>

        {plugins.length === 0 ? (
          <div className="emptyState">No plugins installed</div>
        ) : (
          <div className="recentList">
            {plugins.map((plugin) => (
              <div className="recentItem" key={plugin.id}>
                <strong>{plugin.name}</strong>
                <span>
                  {plugin.version} · {plugin.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>

    <main className="main">
      <header className="topbar">
        <div className="topbarRight">
          <button className="btn" type="button" onClick={handleNewProject}>
            New Project
          </button>

          <button className="btn" type="button" onClick={handleOpenProject}>
            Open Project
          </button>

          <button
            className="btn"
            type="button"
            onClick={async () => {
              try {
                if (!projectRoot) return setStatus("No project open");
                setStatus("Exporting logs...");
                const result = await rpc<{ logPath: string }>("logs.export", { projectRoot });
                setStatus(`Logs: ${result.logPath}`);
                await refreshRecents();
              } catch (e: any) {
                setStatus(`Error: ${e.message}`);
              }
            }}
          >
            Export Logs
          </button>

          <button className="btn" type="button" onClick={handleExportProject}>
            Export Project
          </button>

          <button className="btn" type="button" onClick={handleImportProject}>
            Import Project
          </button>

        </div>
      </header>

      <section className="workspace">
        <Workspace active={active} />
      </section>

      <footer className="statusbar">
        <div className="statusLeft">Status: {status}</div>
        <div className="statusRight">Renderer → Electron dev loop</div>
      </footer>

      {showNew && (
        <Modal title="Create New Project" onClose={() => setShowNew(false)}>
          <div className="fieldRow">
            <div className="label">Project name</div>
            <input
              className="input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="My Project"
            />
          </div>

          <div className="fieldRow">
            <div className="label">Base directory (optional)</div>
            <input
              className="input"
              value={newBaseDir}
              onChange={(e) => setNewBaseDir(e.target.value)}
              placeholder="Defaults to ~/PLProjects"
            />
          </div>

          <div className="row">
            <button
              className="btn"
              type="button"
              onClick={async () => {
                try {
                  setUiError("");
                  setStatus("Creating project...");
                  const result = await rpc<{ projectRoot: string }>("project.create", {
                    name: newName,
                    baseDir: newBaseDir || undefined,
                  });
                  setProjectRoot(result.projectRoot);
                  setStatus(`Created: ${result.projectRoot}`);
                  await refreshRecents();
                  setShowNew(false);
                } catch (e: any) {
                  setUiError(e.message || String(e));
                  setStatus("idle");
                }
              }}
            >
              Create
            </button>

            <button className="btn" type="button" onClick={() => setShowNew(false)}>
              Cancel
            </button>
          </div>

          {uiError && <div className="errorBox">{uiError}</div>}
        </Modal>
      )}

      {showOpen && (
        <Modal title="Open Project" onClose={() => setShowOpen(false)}>
          <div className="fieldRow">
            <div className="label">Project folder path</div>
            <input
              className="input"
              value={openPath}
              onChange={(e) => setOpenPath(e.target.value)}
              placeholder="/home/brandenbarnes/PLProjects/MyProject"
            />
          </div>

          <div className="row">
            <button
              className="btn"
              type="button"
              onClick={async () => {
                try {
                  setOpenError("");
                  const root = openPath.trim();
                  if (!root) {
                    setOpenError("Please enter a project folder path.");
                    return;
                  }

                  setStatus("Opening project...");
                  const result = await rpc<{ projectRoot: string; manifestPath: string; manifest: any }>(
                    "project.open",
                    { projectRoot: root }
                  );

                  setProjectRoot(result.projectRoot);
                  setStatus(`Opened: ${result.projectRoot}`);
                  await refreshRecents();
                  setShowOpen(false);
                } catch (e: any) {
                  setOpenError(e.message || String(e));
                  setStatus("idle");
                }
              }}
            >
              Open
            </button>

            <button className="btn" type="button" onClick={() => setShowOpen(false)}>
              Cancel
            </button>
          </div>

          {openError && <div className="errorBox">{openError}</div>}
        </Modal>
      )}
    </main>
  </div>
);
}

    


function Workspace({ active }: { active: AppId }) {
  switch (active) {
    case "code":
      return <Placeholder title="Code IDE" bullets={["Editor", "Run tasks", "Git helpers (later)"]} />;
    case "game":
      return <Placeholder title="Game Studio" bullets={["Scene graph", "Play mode", "Asset links (later)"]} />;
    case "movie":
      return <Placeholder title="Movie / Animation Studio" bullets={["Media bin", "Timeline", "Export (later)"]} />;
    case "docs":
      return <Placeholder title="Docs" bullets={["Markdown doc", "Export", "Templates (later)"]} />;
    case "sheets":
      return <Placeholder title="Sheets" bullets={["Grid", "Formulas", "CSV import/export (later)"]} />;
    case "modeler":
      return <Placeholder title="Computer Modeling Studio" bullets={["Primitives", "Transforms", "Physics tools (later)"]} />;
    default:
      return null;
  }
}

function Placeholder({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div className="card">
      <div className="cardTitle">{title}</div>
      <div className="cardBody">
        <div className="muted">
          This is a Wave 3 placeholder. We’re building suite structure first.
        </div>
        <ul>
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
