import { app } from "../src/app";
import { writeFileSync } from "node:fs";

const doc = app.getOpenAPI31Document({
	openapi: "3.1.0",
	info: {
		title: "cloudflare-project-2026",
		version: "0.1.0",
	},
});

writeFileSync("openapi.yaml", JSON.stringify(doc, null, 2));
console.log("Generated openapi.yaml (JSON format)");
