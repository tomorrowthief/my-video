// Recreate local commits on GitHub through the Git Data API, then move the branch.
// Usage (run inside the repo):
//   node scripts/github-api-push.mjs [--dry-run] [owner/repo] [branch]
// Token: ~/.github_token (GITHUB_TOKEN env var wins if set).
//
// Each commit is rebuilt from blobs + a tree on top of the remote parent, with the
// local author/committer names, emails and dates, so tree SHAs (and usually commit
// SHAs) come out identical to the local ones. The branch moves with force=false,
// so this aborts instead of overwriting anything new on the remote.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const [repo = "tomorrowthief/my-video", branch = "main"] = args.filter((a) => !a.startsWith("--"));
const git = (...a) => execFileSync("git", a, { encoding: "utf8", maxBuffer: 1 << 30 });
const gitRaw = (...a) => execFileSync("git", a, { maxBuffer: 1 << 30 });

const token = (process.env.GITHUB_TOKEN ?? readFileSync(join(homedir(), ".github_token"), "utf8")).trim();
const api = async (method, path, body) => {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`https://api.github.com/repos/${repo}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) return res.json();
    const text = await res.text();
    if (attempt < 4 && (res.status >= 500 || res.status === 403 || res.status === 429)) {
      await new Promise((r) => setTimeout(r, 2000 * attempt));
      continue;
    }
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 400)}`);
  }
};

// git dates are "<epoch> <+hhmm>"; GitHub keeps the offset when given as ISO 8601.
const isoDate = (epoch, tz) => {
  const sign = tz[0] === "-" ? -1 : 1;
  const offsetMin = sign * (Number(tz.slice(1, 3)) * 60 + Number(tz.slice(3, 5)));
  const local = new Date((Number(epoch) + offsetMin * 60) * 1000).toISOString().slice(0, 19);
  return `${local}${tz.slice(0, 3)}:${tz.slice(3)}`;
};
const person = (line) => {
  const m = /^(.*) <(.*)> (\d+) ([+-]\d{4})$/.exec(line);
  return { name: m[1], email: m[2], date: isoDate(m[3], m[4]) };
};
const readCommit = (sha) => {
  const raw = git("cat-file", "commit", sha);
  const split = raw.indexOf("\n\n");
  const headers = raw.slice(0, split).split("\n");
  const field = (k) => headers.find((h) => h.startsWith(`${k} `)).slice(k.length + 1);
  return { author: person(field("author")), committer: person(field("committer")), message: raw.slice(split + 2) };
};

const pool = async (items, size, fn) => {
  let next = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (next < items.length) await fn(items[next++]);
  }));
};

const localBase = git("rev-parse", `origin/${branch}`).trim();
const commits = git("rev-list", "--reverse", "--first-parent", `origin/${branch}..${branch}`).trim().split("\n").filter(Boolean);
if (commits.length === 0) { console.log("Nothing to push."); process.exit(0); }
for (const c of commits) {
  if (git("rev-list", "--parents", "-n1", c).trim().split(" ").length !== 2) throw new Error(`${c} is a merge commit; not supported`);
}

let remoteHead = localBase;
if (!dryRun) {
  remoteHead = (await api("GET", `/git/ref/heads/${branch}`)).object.sha;
  if (remoteHead !== localBase) throw new Error(`remote ${branch} is ${remoteHead}, local origin/${branch} is ${localBase}; fetch and rebase first`);
}
let remoteTree = git("rev-parse", `${localBase}^{tree}`).trim();
const uploaded = new Set();
let parent = remoteHead;

for (const c of commits) {
  const title = git("log", "-1", "--format=%h %s", c).trim();
  const changes = git("diff-tree", "-r", "-z", "--no-renames", "--no-commit-id", `${c}^`, c).split("\0").filter(Boolean);
  const entries = [];
  const blobs = [];
  for (let i = 0; i < changes.length; i += 2) {
    const [oldMode, newMode, , newSha, status] = changes[i].slice(1).split(" ");
    const path = changes[i + 1];
    if (status === "D") { entries.push({ path, mode: oldMode, type: "blob", sha: null }); continue; }
    if (newMode === "160000") { entries.push({ path, mode: newMode, type: "commit", sha: newSha }); continue; }
    entries.push({ path, mode: newMode, type: "blob", sha: newSha });
    if (!uploaded.has(newSha)) { uploaded.add(newSha); blobs.push(newSha); }
  }
  const bytes = blobs.reduce((n, b) => n + Number(git("cat-file", "-s", b)), 0);
  console.log(`${title}\n  ${entries.length} paths, ${blobs.length} new blobs, ${(bytes / 1e6).toFixed(1)} MB`);
  const wantTree = git("rev-parse", `${c}^{tree}`).trim();
  if (dryRun) { remoteTree = wantTree; parent = c; continue; }

  let done = 0;
  await pool(blobs, 6, async (sha) => {
    const got = await api("POST", "/git/blobs", { content: gitRaw("cat-file", "blob", sha).toString("base64"), encoding: "base64" });
    if (got.sha !== sha) throw new Error(`blob mismatch for ${sha}: ${got.sha}`);
    if (++done % 50 === 0) console.log(`  blobs ${done}/${blobs.length}`);
  });
  const tree = await api("POST", "/git/trees", { base_tree: remoteTree, tree: entries });
  if (tree.sha !== wantTree) throw new Error(`tree mismatch for ${title}: got ${tree.sha}, want ${wantTree}`);
  const { author, committer, message } = readCommit(c);
  const made = await api("POST", "/git/commits", { message, tree: tree.sha, parents: [parent], author, committer });
  console.log(`  → ${made.sha}${made.sha === c ? " (identical to local)" : ""}`);
  remoteTree = tree.sha;
  parent = made.sha;
}

if (dryRun) { console.log(`\nDry run: ${commits.length} commits would move ${branch} from ${localBase.slice(0, 7)}.`); process.exit(0); }
await api("PATCH", `/git/refs/heads/${branch}`, { sha: parent, force: false });
console.log(`\n${repo} ${branch} → ${parent}`);
console.log(parent === commits.at(-1) ? "Remote matches local exactly." : `Local differs; run: git fetch origin && git reset --soft origin/${branch}`);
