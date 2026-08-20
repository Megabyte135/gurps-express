import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/themes/base.css";
import "./styles/themes/fantasy.css";
import "./styles/themes/scifi.css";
import "./styles/base.css";
import "./styles/primitives.css";
import App from "./App";

const container = document.getElementById("root");
if (container === null) throw new Error("Root container #root is missing");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
