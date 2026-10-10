import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../src/index.css";
import { App } from "./App";

const root = document.getElementById("root");
if (root === null) throw new Error("web: #root is missing from index.html");

createRoot(root).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
