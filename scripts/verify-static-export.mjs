import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const outputRoot = path.resolve(process.cwd(), "dist/client");
const requiredFiles = [
  "index.html",
  "404.html",
  "index.rsc",
  "fonts/anton-latin.woff2",
  "fonts/jong-sans.woff2",
];
const failures = [];
const files = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(outputRoot, absolutePath);
    const stats = await lstat(absolutePath);

    if (stats.isSymbolicLink()) {
      failures.push(`静态产物中不允许出现符号链接：${relativePath}`);
      continue;
    }
    if (stats.isDirectory()) {
      await walk(absolutePath);
      continue;
    }
    if (!stats.isFile()) continue;

    if (/^\.env(?:\.|$)/i.test(entry.name) || /\.(?:key|pem|p12)$/i.test(entry.name)) {
      failures.push(`静态产物中发现疑似敏感文件：${relativePath}`);
    }
    files.push({ absolutePath, relativePath, size: stats.size });
  }
}

try {
  await walk(outputRoot);
} catch (error) {
  if (error?.code === "ENOENT") {
    throw new Error("找不到 dist/client，请先运行 pnpm build。", { cause: error });
  }
  throw error;
}

for (const relativePath of requiredFiles) {
  if (!files.some((file) => file.relativePath === relativePath)) {
    failures.push(`缺少必要的静态文件：${relativePath}`);
  }
}

if (!files.some((file) => file.relativePath.startsWith("_next/static/"))) {
  failures.push("缺少 _next/static 构建资源。");
}

const textFiles = files.filter((file) => /\.(?:css|html|js|mjs|rsc|json)$/i.test(file.relativePath));
const localReferences = new Set();
for (const file of textFiles) {
  const content = await readFile(file.absolutePath, "utf8");
  const externalAssetPatterns = [
    /<(?:script|img|video|audio|source|iframe)\b[^>]*\b(?:src|srcset|poster)=["']https?:\/\//i,
    /<link\b(?=[^>]*\brel=["'][^"']*(?:stylesheet|preload|modulepreload|icon))[^>]*\bhref=["']https?:\/\//i,
    /(?:@import\s+|url\(\s*)["']?(?:https?:)?\/\//i,
    /fonts\.(?:googleapis|gstatic)\.com/i,
    /https?:\/\/[^"'`\s)]+\.(?:css|m?js|woff2?|ttf|otf|eot|png|jpe?g|webp|avif|gif|svg|mp3|m4a|wav|ogg|mp4|webm)(?:[?#][^"'`\s)]*)?/i,
  ];
  if (externalAssetPatterns.some((pattern) => pattern.test(content))) {
    failures.push(`发现外部静态素材地址，请改为本地文件：${file.relativePath}`);
  }

  for (const match of content.matchAll(/[('"`]\s*(\/(?:_next|assets|fonts)\/[^'"`?#\\\s),}]+|\/favicon\.svg)/g)) {
    localReferences.add(decodeURIComponent(match[1]).replace(/^\//, ""));
  }
}

for (const relativePath of localReferences) {
  if (!files.some((file) => file.relativePath === relativePath)) {
    failures.push(`入口页面引用了不存在的本地资源：${relativePath}`);
  }
}

if (failures.length > 0) {
  console.error("静态部署校验失败：");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const totalBytes = files.reduce((total, file) => total + file.size, 0);
const mebibytes = (totalBytes / 1024 / 1024).toFixed(1);
console.log(`静态部署校验通过：${files.length} 个文件，共 ${mebibytes} MiB；没有检测到缺失文件、敏感文件或外部静态素材。`);
