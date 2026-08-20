import { createElement } from "react";
import { createServer } from "vite";

const server = await createServer({
  root: process.cwd(),
  logLevel: "error",
  server: { middlewareMode: true },
});

try {
  const { renderToString } = await import("react-dom/server");
  const { default: App } = await server.ssrLoadModule("/src/App.tsx");
  const html = renderToString(createElement(App));
  console.log("RENDER OK, length:", html.length);
  console.log("has skeleton:", html.includes("sheet-skeleton"));
} catch (error) {
  console.error("RENDER FAILED:");
  console.error(error);
  process.exitCode = 1;
} finally {
  await server.close();
}
