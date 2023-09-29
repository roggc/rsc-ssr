import path from "path";
import fs from "fs-extra";
import fg from "fast-glob";

const eject = async (settings = {}) => {
  const nodeModulesDir = settings.sourceDir || path.join(".", "node_modules");
  const destDir = settings.destDir || path.join(".", "ejected");
  const codeFiles = settings.codeFiles || [
    "src/**/*.{js,jsx,ts,tsx,mjs,es,es6}",
    "*.{js,jsx,ts,tsx,mjs,es,es6}",
  ];
  const updatedFiles = new Set();
  let updatedDependencies = new Set();
  await fs.ensureDir(destDir);
  if (!(await fs.pathExists(nodeModulesDir)))
    throw new Error("node_modules not found");
  const pkg = await fs.readJson(path.join(".", "package.json"));
  let dependencies = Object.keys(pkg.dependencies);
  const files = (await fg(codeFiles)).filter((file) =>
    settings.updateTestFiles
      ? true
      : !(file.includes(".test.") || file.includes(".spec."))
  );
  for await (const file of files) {
    let contents = await fs.readFile(path.join(".", file), "utf8");
    for (const dependency of dependencies)
      if (contents.includes(dependency)) updatedDependencies.add(dependency);
  }
  if (settings.dependenciesFilter)
    updatedDependencies = settings.dependenciesFilter(updatedDependencies);
  for await (const dependency of updatedDependencies) {
    await fs.copy(
      path.join(path.join(nodeModulesDir, dependency), "src"),
      path.join(destDir, dependency)
    );
  }
  for await (const file of files) {
    let contents = await fs.readFile(path.join(".", file), "utf8");
    const pathToSource = (path.join(".", file).match(/\\/g) || []).length;
    for (const dependency of updatedDependencies) {
      if (contents.includes(dependency)) updatedFiles.add(file);
      contents = contents
        .replace(
          `"${dependency}/server"`,
          `"${
            pathToSource > 0 ? "../".repeat(pathToSource) : "./"
          }${dependency}/server/index.js"`
        )
        .replace(
          `"${dependency}/client"`,
          `"${
            pathToSource > 0 ? "../".repeat(pathToSource) : "./"
          }${dependency}/client/index.js"`
        );
    }
    if (!updatedFiles.has(file)) continue;
    await fs.writeFile(path.join(".", file), contents);
  }
  return { updatedFiles, updatedDependencies };
};

eject({
  sourceDir: "./node_modules",
  destDir: ".",
  codeFiles: ["src/**/*.{js,jsx,ts,tsx,mjs,es,es6}"],
  dependenciesFilter: (set) => {
    for (const e of set) {
      if (e === "rsc-ssr-module") {
        const newSet = new Set();
        newSet.add(e);
        return newSet;
      }
    }
  },
});
