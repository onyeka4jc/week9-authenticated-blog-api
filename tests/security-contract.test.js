const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("documented authentication and article API routes are mounted", () => {
  const server = read("server.js");
  assert.match(server, /app\.use\("\/api\/auth", authRoutes\)/);
  assert.match(server, /app\.use\("\/api\/articles", articleRoutes\)/);
});

test("authentication middleware protects the entire article router", () => {
  const routes = read("routes/articleRoutes.js");
  assert.ok(routes.indexOf("router.use(requireAuth)") >= 0);
  assert.ok(routes.indexOf("router.use(requireAuth)") < routes.indexOf('router.post("/"'));
});

test("article ownership checks guard both update and delete", () => {
  const controller = read("controllers/articleController.js");
  assert.match(controller, /const updateArticle = async/);
  assert.match(controller, /const deleteArticle = async/);
  assert.equal((controller.match(/if \(!userOwnsArticle\(article, req\.user\)\)/g) || []).length, 2);
  assert.match(controller, /status\(403\)/);
});

test("the Article model contains a User reference", () => {
  const model = read("models/article.js");
  assert.match(model, /userId:\s*\{/);
  assert.match(model, /ref:\s*"User"/);
  assert.match(model, /required:\s*true/);
});
