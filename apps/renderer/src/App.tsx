import { useMemo, useState } from "react";
import "./app.css";

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
          <div className="tiny">Project: (none)</div>
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
            <button className="btn" type="button">
              New Project
            </button>
            <button className="btn" type="button">
              Open Project
            </button>
            <button className="btn" type="button">
              Settings
            </button>
          </div>
        </header>

        <section className="workspace">
          <Workspace active={active} />
        </section>

        <footer className="statusbar">
          <div className="statusLeft">Status: idle</div>
          <div className="statusRight">Renderer → Electron dev loop</div>
        </footer>
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
