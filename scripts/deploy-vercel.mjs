// Creates Vercel project (if missing), pushes env vars from .env.local,
// writes .vercel/project.json, then triggers `vercel --prod` via CLI.

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const envPath = path.join(repoRoot, ".env.local");

function loadEnv() {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();

const TOKEN = process.env.VERCEL_TOKEN;
const TEAM_ID = process.env.VERCEL_TEAM_ID;
const PROJECT_NAME = "arctrust";

if (!TOKEN || !TEAM_ID) {
  console.error("VERCEL_TOKEN or VERCEL_TEAM_ID missing");
  process.exit(1);
}

const api = (suffix) =>
  `https://api.vercel.com${suffix}${suffix.includes("?") ? "&" : "?"}teamId=${TEAM_ID}`;

async function vfetch(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

async function findOrCreateProject() {
  const lookup = await vfetch(api(`/v10/projects/${PROJECT_NAME}`));
  if (lookup.ok) {
    console.log(`Project '${PROJECT_NAME}' already exists: ${lookup.json.id}`);
    return lookup.json;
  }
  console.log(`Creating Vercel project '${PROJECT_NAME}'...`);
  const create = await vfetch(api("/v10/projects"), {
    method: "POST",
    body: JSON.stringify({ name: PROJECT_NAME, framework: "nextjs" }),
  });
  if (!create.ok) {
    throw new Error(`createProject failed: ${create.status} ${JSON.stringify(create.json)}`);
  }
  console.log(`  created: ${create.json.id}`);
  return create.json;
}

const ENV_KEYS_TO_PUSH = [
  "CIRCLE_API_KEY",
  "CIRCLE_CLIENT_API_KEY",
  "CIRCLE_ENTITY_SECRET",
  "CIRCLE_WALLET_SET_ID",
  "CIRCLE_SENDER_WALLET_ID",
  "CIRCLE_SENDER_WALLET_ADDRESS",
  "CIRCLE_PROVIDER_WALLET_ID",
  "CIRCLE_PROVIDER_WALLET_ADDRESS",
  "CIRCLE_ARC_BLOCKCHAIN",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

async function pushEnv(projectId) {
  console.log("Pushing env vars to Vercel project...");
  for (const key of ENV_KEYS_TO_PUSH) {
    const value = process.env[key];
    if (!value) {
      console.log(`  skip (missing locally): ${key}`);
      continue;
    }
    // First try to delete any existing entry of same key (idempotent re-runs)
    const existing = await vfetch(api(`/v9/projects/${projectId}/env`));
    if (existing.ok && Array.isArray(existing.json?.envs)) {
      for (const e of existing.json.envs) {
        if (e.key === key) {
          await vfetch(api(`/v9/projects/${projectId}/env/${e.id}`), { method: "DELETE" });
        }
      }
    }
    const create = await vfetch(api(`/v10/projects/${projectId}/env`), {
      method: "POST",
      body: JSON.stringify({
        key,
        value,
        type: "encrypted",
        target: ["production", "preview", "development"],
      }),
    });
    if (create.ok) {
      console.log(`  set ${key}`);
    } else {
      console.log(`  WARN ${key}: ${create.status} ${JSON.stringify(create.json)}`);
    }
  }
}

function writeLink(projectId) {
  const dir = path.join(repoRoot, ".vercel");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const link = { projectId, orgId: TEAM_ID, projectName: PROJECT_NAME };
  fs.writeFileSync(path.join(dir, "project.json"), JSON.stringify(link, null, 2));
  console.log("Wrote .vercel/project.json");
}

function runVercelDeploy() {
  return new Promise((resolve, reject) => {
    console.log("Running `vercel --prod` ...");
    const child = spawn(
      "npx",
      ["--yes", "vercel@latest", "--prod", "--yes", "--token", TOKEN],
      { cwd: repoRoot, stdio: ["ignore", "pipe", "pipe"] }
    );
    let output = "";
    child.stdout.on("data", (d) => {
      const s = d.toString();
      output += s;
      process.stdout.write(s);
    });
    child.stderr.on("data", (d) => {
      const s = d.toString();
      output += s;
      process.stderr.write(s);
    });
    child.on("close", (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(`vercel exit ${code}`));
    });
  });
}

async function main() {
  const project = await findOrCreateProject();
  await pushEnv(project.id);
  writeLink(project.id);
  await runVercelDeploy();
}

main().catch((err) => {
  console.error("FATAL", err);
  process.exit(1);
});
