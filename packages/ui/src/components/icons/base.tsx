import { makeIconSet } from "./icon-kit";
import type { IconSet } from "./icon-kit";

export const baseSet: IconSet = makeIconSet(
  { stroke: 1.7, caps: "round" },
  {
    dice: (
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
        <circle cx="8.5" cy="8.5" r="1.15" fill="currentColor" stroke="none" />
        <circle cx="15.5" cy="8.5" r="1.15" fill="currentColor" stroke="none" />
        <circle cx="8.5" cy="15.5" r="1.15" fill="currentColor" stroke="none" />
        <circle cx="15.5" cy="15.5" r="1.15" fill="currentColor" stroke="none" />
      </>
    ),
    chevron: <path d="M9 5l7 7-7 7" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6" />
        <path d="M15 15l5.5 5.5" />
      </>
    ),
    close: (
      <>
        <path d="M5 5l14 14" />
        <path d="M19 5L5 19" />
      </>
    ),
    save: (
      <>
        <path d="M5 3.5h11L19.5 7v13.5H5z" />
        <path d="M8 3.5v5h8v-5" />
        <path d="M8 20.5v-6h8v6" />
      </>
    ),
    undo: (
      <>
        <path d="M8 5L3.5 9.5 8 14" />
        <path d="M3.5 9.5H15a5.5 5.5 0 0 1 0 11h-4" />
      </>
    ),
    redo: (
      <>
        <path d="M16 5l4.5 4.5L16 14" />
        <path d="M20.5 9.5H9a5.5 5.5 0 0 0 0 11h4" />
      </>
    ),
    reset: (
      <>
        <path d="M4 5v5h5" />
        <path d="M4.5 10a8 8 0 1 1 2.2 5.6" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3L7 7M17 17l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7" />
      </>
    ),
    moon: <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z" />,
    palette: (
      <>
        <path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.2 0 1.9-.8 1.9-1.7 0-1.5 1-2.3 2.4-2.3h1.5a3 3 0 0 0 3-3.2A8.6 8.6 0 0 0 12 3.5z" />
        <circle cx="7.8" cy="10.2" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="7.6" r="1" fill="currentColor" stroke="none" />
        <circle cx="16.2" cy="10.2" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    panel: (
      <>
        <rect x="3.5" y="5" width="17" height="14" rx="2" />
        <path d="M15 5v14" />
      </>
    ),
    edit: (
      <>
        <path d="M16.5 3.5l4 4L8 20l-5 1 1-5L16.5 3.5z" />
        <path d="M14.5 5.5l4 4" />
      </>
    ),
  },
);
