import { makeIconSet } from "./icon-kit";
import type { IconSet } from "./icon-kit";

export const scifiSet: IconSet = makeIconSet(
  { stroke: 1.5, caps: "square" },
  {
    dice: (
      <>
        <path d="M12 2.8l8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8z" />
        <path d="M3.8 7.4L12 12l8.2-4.6M12 12v9.2" />
        <circle cx="12" cy="8.6" r="1.1" fill="currentColor" stroke="none" />
      </>
    ),
    chevron: <path d="M10 5l7 7-7 7" />,
    search: (
      <>
        <rect x="4" y="4" width="12" height="12" />
        <path d="M16 12.5l5 5" />
        <circle cx="10" cy="10" r="1.2" fill="currentColor" stroke="none" />
      </>
    ),
    close: (
      <>
        <path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" />
        <path d="M9 9l6 6M15 9l-6 6" />
      </>
    ),
    save: (
      <>
        <rect x="5" y="5.5" width="14" height="10" rx="1" />
        <path d="M8 15.5v3.5M12 15.5V19M16 15.5V19" />
        <circle cx="12" cy="10.5" r="1.4" />
      </>
    ),
    undo: (
      <>
        <path d="M9 4H4v5" />
        <path d="M4 9h10a5.5 5.5 0 0 1 0 11H9" />
      </>
    ),
    redo: (
      <>
        <path d="M15 4h5v5" />
        <path d="M20 9H10a5.5 5.5 0 0 0 0 11h5" />
      </>
    ),
    reset: (
      <>
        <path d="M4 5v5h5" />
        <path d="M4.5 10a8 8 0 1 1 2.4 5.8" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="3.8" />
        <path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21" />
        <path d="M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7" strokeWidth="1.1" />
      </>
    ),
    moon: <path d="M18.5 3.5a9 9 0 1 0 2.3 10A7.2 7.2 0 0 1 18.5 3.5z" />,
    palette: (
      <>
        <path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9L12 3z" />
        <circle cx="12" cy="7.8" r="1" fill="currentColor" stroke="none" />
        <circle cx="8.6" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="15.4" cy="12" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    panel: (
      <>
        <rect x="3.5" y="5" width="17" height="14" />
        <path d="M15.5 5v14" />
        <path d="M12.5 10.5L10 12l2.5 1.5" />
      </>
    ),
    edit: (
      <>
        <path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" />
        <path d="M8 16l8-8M13 11l2 2" />
      </>
    ),
  },
);
