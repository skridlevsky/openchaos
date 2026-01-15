// Node script that copies the wasm file into public/ for Turbopack fetch().
const fs = require("fs");
const path = require("path");

try {
  const src = path.join(
    process.cwd(),
    "src",
    "wasm",
    "pkg",
    "openchaos_wasm_bg.wasm"
  );
  const destDir = path.join(process.cwd(), "public", "wasm");
  const dest = path.join(destDir, "openchaos_wasm_bg.wasm");

  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log("Copied", src, "→", dest);
} catch (err) {
  console.error("Failed to copy wasm:", err);
  process.exit(1);
}
