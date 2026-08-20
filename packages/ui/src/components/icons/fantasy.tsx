import { makeIconSet } from "./icon-kit";
import type { IconSet } from "./icon-kit";

export const fantasySet: IconSet = makeIconSet(
  { stroke: 2.1, caps: "square" },
  {
    dice: (
      <>
        <rect x="3.5" y="3.5" width="17" height="17" />
        <path d="M12 8l4 4-4 4-4-4z" />
        <path d="M6.5 6.5h2M15.5 6.5h2M6.5 17.5h2M15.5 17.5h2" strokeWidth="1.3" />
      </>
    ),
    chevron: <path d="M9 5l7 7-7 7" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6" />
        <path d="M15 15l5.5 5.5" />
        <path d="M18.5 18.5l2 2" strokeWidth="1.3" />
      </>
    ),
    close: (
      <>
        <path d="M5 5l14 14" />
        <path d="M19 5L5 19" />
        <path d="M4.5 8V5.5h2.5M19.5 8V5.5h-2.5" strokeWidth="1.3" />
      </>
    ),
    save: (
      <>
        <path d="M5 3.5h11L19.5 7v13.5H5z" />
        <path d="M16 3.5V7h3.5" />
        <path d="M8.5 12h7M8.5 15.5h5" strokeWidth="1.3" />
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
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2v2.6M12 19.4V22M2 12h2.6M19.4 12H22" />
        <path d="M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" strokeWidth="1.3" />
      </>
    ),
    moon: (
      <>
        <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z" />
        <path d="M17.5 4.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" fill="currentColor" stroke="none" />
      </>
    ),
    palette: (
      <>
        <path d="M12 3l9 9-9 9-9-9z" />
        <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
        <circle cx="8.5" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="15.5" cy="12" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    panel: (
      <>
        <rect x="3.5" y="5" width="17" height="14" />
        <path d="M15 5v14" />
        <path d="M9.5 12h3" strokeWidth="1.3" />
      </>
    ),
    edit: (
      <>
        <path d="M16.5 3.5l4 4L8 20l-5 1 1-5L16.5 3.5z" />
        <path d="M6 18.5l1 1M14.5 5.5l4 4" strokeWidth="1.3" />
      </>
    ),
  },
);
