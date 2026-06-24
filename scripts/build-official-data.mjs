import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const repoUrl = process.env.XLLM_REPO_URL || "https://github.com/jd-opensource/xllm.git";
const repoGitDir = resolve(process.env.XLLM_REPO_CACHE || ".cache/xllm.git");
const outputPath = resolve("site/data/official-xllm.json");
const ref = process.argv[2] || process.env.XLLM_REF || "main";

syncRepository();

const raw = execFileSync("git", [
  `--git-dir=${repoGitDir}`,
  "log",
  ref,
  "--date=iso-strict",
  "--numstat",
  "--pretty=format:%x1e%H%x1f%P%x1f%aN%x1f%aE%x1f%cI%x1f%s"
], { encoding: "utf8", maxBuffer: 1024 * 1024 * 128 });

const commits = raw
  .split("\x1e")
  .map((block) => block.trim())
  .filter(Boolean)
  .map(parseCommit)
  .filter(Boolean);

const byDate = groupBy(commits, (commit) => commit.dateKey);
const byAuthor = [...groupBy(commits, (commit) => commit.author.name).entries()]
  .map(([name, items]) => ({
    name,
    commits: items.length,
    additions: sum(items, "additions"),
    deletions: sum(items, "deletions"),
    files: sum(items, "filesChanged")
  }))
  .sort((a, b) => b.commits - a.commits || (b.additions + b.deletions) - (a.additions + a.deletions));

const byModule = countBy(commits, (commit) => commit.module);
const byType = countBy(commits, (commit) => commit.type);
const activeDates = [...byDate.keys()].sort();

const data = {
  generatedAt: new Date().toISOString(),
  repo: {
    id: "xllm",
    name: "xllm",
    fullName: "jd-opensource/xllm",
    url: "https://github.com/jd-opensource/xllm",
    ref
  },
  summary: {
    commits: commits.length,
    contributors: byAuthor.length,
    additions: sum(commits, "additions"),
    deletions: sum(commits, "deletions"),
    filesChanged: sum(commits, "filesChanged"),
    firstDate: activeDates[0] || "",
    latestDate: activeDates.at(-1) || "",
    topAuthors: byAuthor.slice(0, 12),
    topModules: byModule.slice(0, 12),
    typeBreakdown: byType
  },
  dates: activeDates,
  commits
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(`Wrote ${commits.length} commits from ${data.repo.fullName} to ${outputPath}`);

function syncRepository() {
  mkdirSync(dirname(repoGitDir), { recursive: true });
  if (existsSync(repoGitDir)) {
    execFileSync("git", [
      `--git-dir=${repoGitDir}`,
      "fetch",
      "--prune",
      "origin",
      "+refs/heads/*:refs/heads/*",
      "+refs/tags/*:refs/tags/*"
    ], { stdio: "inherit" });
    return;
  }

  execFileSync("git", ["clone", "--mirror", repoUrl, repoGitDir], { stdio: "inherit" });
}

function parseCommit(block) {
  const lines = block.split(/\r?\n/);
  const [sha, parents, authorName, authorEmail, date, subject] = lines[0].split("\x1f");
  if (!sha || !date) return null;

  const changedFiles = [];
  let additions = 0;
  let deletions = 0;
  for (const line of lines.slice(1)) {
    const parts = line.split("\t");
    if (parts.length < 3) continue;
    const add = parts[0] === "-" ? 0 : Number(parts[0]) || 0;
    const del = parts[1] === "-" ? 0 : Number(parts[1]) || 0;
    const filename = parts.slice(2).join("\t");
    additions += add;
    deletions += del;
    changedFiles.push({ filename, additions: add, deletions: del, module: moduleFromPath(filename) });
  }

  const title = subject || "";
  const type = classifyType(title);
  const module = classifyModule(title, changedFiles);
  const tags = buildTags({ title, type, module, additions, deletions, filesChanged: changedFiles.length });
  const pr = title.match(/\(#(\d+)\)\s*$/)?.[1] || "";

  return {
    sha,
    parents: parents ? parents.split(" ").filter(Boolean) : [],
    pr,
    date,
    dateKey: dayKey(date),
    author: { name: authorName || "unknown", email: authorEmail || "" },
    title,
    type,
    module,
    additions,
    deletions,
    filesChanged: changedFiles.length,
    files: changedFiles,
    tags,
    url: `https://github.com/jd-opensource/xllm/commit/${sha}`
  };
}

function classifyType(title) {
  const t = title.toLowerCase();
  if (/\b(perf|performance|optimi[sz]e|overhead|latency|throughput|cache|prefetch)\b/.test(t)) return "performance";
  if (/\b(fix|bugfix|bug|wrong|crash|fail|restore|revert|avoid)\b/.test(t)) return "bugfix";
  if (/\b(refactor|cleanup|clean|rename|style|rework|simplify)\b/.test(t)) return "refactor";
  if (/\b(test|ci|benchmark|eval|coverage)\b/.test(t)) return "test";
  if (/\b(doc|readme|guide)\b/.test(t)) return "docs";
  if (/\b(feat|feature|support|add|enable|implement|integrate)\b/.test(t)) return "feature";
  if (/\b(build|chore)\b/.test(t)) return "chore";
  return "other";
}

function classifyModule(title, files) {
  const text = `${title} ${files.map((file) => file.filename).join(" ")}`.toLowerCase();
  if (/\b(npu|acl|torch_npu|graph|decode|mtp|draft|spec)\b/.test(text)) return "NPU / Spec Decode";
  if (/\b(moe|expert|routing|dispatch|combine|gmm|ffn)\b/.test(text)) return "MoE";
  if (/\b(qwen|deepseek|glm|kimi|minimax|hunyuan|internvl|llama|vlm|model)\b/.test(text)) return "Model Support";
  if (/\b(scheduler|engine|worker|executor|runner|prefix|cache|block)\b/.test(text)) return "Inference Engine";
  if (/\b(mlu|dcu|cuda|gpu|device)\b/.test(text)) return "Device Backend";
  if (/\b(test|ci|benchmark|eval|coverage)\b/.test(text)) return "Testing";
  if (/\b(doc|readme|workflow|cmake|build|docker|config|yaml)\b/.test(text)) return "Engineering";
  return files[0]?.module || "Other";
}

function moduleFromPath(filename) {
  const parts = filename.split("/");
  if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
  return parts[0] || "Other";
}

function buildTags(commit) {
  const tags = new Set([commit.type, commit.module.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")].filter(Boolean));
  const churn = commit.additions + commit.deletions;
  if (churn >= 1500 || commit.filesChanged >= 20) tags.add("high-risk");
  else if (churn >= 300 || commit.filesChanged >= 8) tags.add("medium-risk");
  if (/\b(npu|acl|torch_npu|ascend|graph|decode|mtp)\b/i.test(`${commit.title} ${commit.module}`)) tags.add("affects-ascend");
  return [...tags];
}

function dayKey(value) {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function groupBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}

function countBy(items, keyFn) {
  return [...groupBy(items, keyFn).entries()]
    .map(([key, values]) => ({ key, count: values.length }))
    .sort((a, b) => b.count - a.count);
}

function sum(items, field) {
  return items.reduce((total, item) => total + (item[field] || 0), 0);
}
