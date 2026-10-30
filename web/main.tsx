import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "../src/index.css";

const isStudio = /^\/studio(?:\/|$)/.test(window.location.pathname);
const Application = isStudio
  ? lazy(() =>
      import("../src/studio/StudioApp").then((m) => ({ default: m.StudioApp })),
    )
  : lazy(() => import("./App").then((m) => ({ default: m.App })));

const root = document.getElementById("root");
if (root === null) throw new Error("web: #root is missing from index.html");

createRoot(root).render(
  <StrictMode>
    <Suspense fallback={<p style={{ padding: 32 }}>正在打开工作区…</p>}>
      <Application />
    </Suspense>
  </StrictMode>,
);
