import type {
  NavItem,
} from "../types/app";


export const NAV_ITEMS:
  readonly NavItem[] = [
    {
      id: "code",
      label: "Code IDE",
      hint:
        "Scripts and local files",
    },

    {
      id: "game",
      label: "Game Studio",
      hint:
        "Scenes and gameplay data",
    },

    {
      id: "movie",
      label: "Movie Studio",
      hint:
        "Timeline and animation",
    },

    {
      id: "docs",
      label: "Docs",
      hint:
        "Markdown notes and writing",
    },

    {
      id: "sheets",
      label: "Sheets",
      hint:
        "Local grids and tables",
    },

    {
      id: "modeler",
      label: "Modeling",
      hint:
        "3D scenes and objects",
    },
  ];
