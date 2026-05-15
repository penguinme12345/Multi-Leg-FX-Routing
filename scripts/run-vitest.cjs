const { execFileSync, spawnSync } = require("node:child_process");
const path = require("node:path");

function getWindowsShortPath() {
  const output = execFileSync("cmd.exe", ["/c", "for %I in (.) do @echo %~sI"], {
    cwd: process.cwd(),
    encoding: "utf8"
  });

  return output.trim();
}

const root = process.platform === "win32" ? getWindowsShortPath() : process.cwd();
const vitestBin = path.join(root, "node_modules", "vitest", "vitest.mjs");
const result = spawnSync(process.execPath, [vitestBin, "run", "--root", root], {
  cwd: root,
  stdio: "inherit"
});

process.exit(result.status ?? 1);
