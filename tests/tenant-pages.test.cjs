/* eslint-disable @typescript-eslint/no-require-imports -- This harness loads transpiled CommonJS modules in a VM. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const ts = require("typescript");

const pages = ["dashboard", "leads", "inbox", "appointments", "pipeline", "settings"];
function loadPage(page, session) {
  const queries = [];
  const db = Object.fromEntries(["lead", "deal", "appointment", "organization"].map(model => [
    model, Object.fromEntries(["count", "aggregate", "findMany", "findUnique"].map(method => [
      method, async args => {
        queries.push({ model, method, args });
        if (method === "count") return 0;
        if (method === "aggregate") return { _sum: { amount: null } };
        if (method === "findUnique") return null;
        return [];
      },
    ])),
  ]));
  const file = path.join(__dirname, "../src/app/(saas)", page, "page.tsx");
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: file,
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    require: name => {
      if (name === "@/lib/auth") return { auth: async () => session };
      if (name === "@/lib/db") return { db };
      if (name === "next/navigation") return { redirect: url => { throw new Error("redirect:" + url); } };
      return require(name);
    },
  }, { filename: file });
  return { render: exports.default, queries };
}
for (const page of pages) {
  test(page + " rejects an unauthenticated request before database access", async () => {
    const { render, queries } = loadPage(page, null);
    await assert.rejects(render(), /redirect:\/login/);
    assert.equal(queries.length, 0);
  });
  test(page + " rejects a session without an organisation before database access", async () => {
    for (const organizationId of [null, undefined, ""]) {
      const { render, queries } = loadPage(page, { user: { id: "user-a" }, organizationId });
      await assert.rejects(render(), /redirect:\/login/);
      assert.equal(queries.length, 0);
    }
  });
  test(page + " scopes its queries to the session organisation", async () => {
    const { render, queries } = loadPage(page, {
      user: { id: "user-a", name: "Test User" }, organizationId: "tenant-a",
    });
    await render();
    assert.ok(queries.length > 0);
    for (const { model, args } of queries) {
      assert.equal(model === "organization" ? args.where.id : args.where.organizationId, "tenant-a");
    }
  });
}
