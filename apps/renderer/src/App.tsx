import { useMemo, useState } from "react";
import { rpc } from "./rpc";
import "./app.css";
import { Modal } from "./components/Modal";


type AppId = "code" | "game" | "movie" | "docs" | "sheets" | "modeler";

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
  const activeItem = navItems.find((n) => n.id === active)!;
  const [projectRoot, setProjectRoot] = useState<string>("");
  const [status, setStatus] = useState<string>("idle");
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("TestProject");
  const [newBaseDir, setNewBaseDir] = useState("");
  const [uiError, setUiError] = useState("");



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
          <div className="tiny">Project: {projectRoot ? projectRoot : "none"}</div>
          <div className="tiny">Workspace: single-window</div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbarLeft">
            <div className="activeTitle">{activeItem.label}</div>
            <div className="activeSub">Project workflows will live here.</div>
          </div>

<div className="topbarRight">
  <button
  className="btn"
  type="button"
  onClick={() => {
    setUiError("");
    setShowNew(true);
  }}
>
  New Project
</button>


  <button
    className="btn"
    type="button"
    onClick={async () => {
      try {
        const root = prompt("Enter project folder path to open:", projectRoot || "");
        if (!root) return;
        setStatus("Opening project...");
        const result = await rpc<{ projectRoot: string; manifestPath: string; manifest: any }>("project.open", {
          projectRoot: root,
        });
        setProjectRoot(result.projectRoot);
        setStatus(`Opened: ${result.projectRoot}`);
      } catch (e: any) {
        setStatus(`Error: ${e.message}`);
      }
    }}
  >
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
      } catch (e: any) {
        setStatus(`Error: ${e.message}`);
      }
    }}
  >
    Export Logs
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
      </main>
{showNew && (
  <Modal
    title="Create New Project"
    onClose={() => setShowNew(false)}
  >
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
