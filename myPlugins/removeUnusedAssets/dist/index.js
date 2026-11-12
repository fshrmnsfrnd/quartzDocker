import fs from "fs";
import path from "path";

// Hilfsfunktion: Dateipfad analog zu Quartz' slugifyFilePath normalisieren
function normalizeKey(p) {
  const cleaned = decodeURIComponent(p.split("#")[0].split("?")[0])
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  return cleaned
    .split("/")
    .map((seg) => seg.trim().replace(/\s+/g, "-"))
    .join("/");
}

// Rekursiv alle Dateien in einem Ordner sammeln
async function walkDir(dir, baseDir) {
  const results = [];
  let entries;
  try {
    entries = await fs.promises.readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkDir(fullPath, baseDir)));
    } else if (entry.isFile()) {
      results.push(path.relative(baseDir, fullPath).replace(/\\/g, "/"));
    }
  }
  return results;
}

// Alle Links & Embeds (src, href, data.links) aus einer Seite extrahieren
function extractTargets(tree, vfile) {
  const targets = new Set();
  const slug = String(vfile.data?.slug ?? "");
  const pageDir = slug.includes("/") ? slug.slice(0, slug.lastIndexOf("/")) : "";

  const addRef = (raw) => {
    if (!raw || typeof raw !== "string") return;
    if (/^(https?:|mailto:|tel:|data:|#)/i.test(raw)) return;

    const clean = raw.split("#")[0].split("?")[0];
    if (!clean) return;

    const resolved = clean.startsWith("/")
      ? clean.slice(1)
      : path.posix.normalize(pageDir ? `${pageDir}/${clean}` : clean);

    const norm = normalizeKey(resolved);
    targets.add(norm);
    targets.add(norm.replace(/\.md$/i, ""));
  };

  // 1. Interne Links aus Quartz (z. B. [[zeichnung.excalidraw]])
  for (const link of vfile.data?.links ?? []) {
    addRef("/" + String(link));
  }

  // 2. HAST-Baum nach eingebetteten Medien & Links durchsuchen
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    const props = node.properties;
    if (props) {
      if (props.src) addRef(props.src);
      if (props.href) addRef(props.href);
      if (props.dataSrc) addRef(props.dataSrc);
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) visit(child);
    }
  };
  visit(tree);

  return targets;
}

export const PruneUnusedAssets = (userOpts) => {
  const targetPaths = (userOpts?.paths ?? ["src"]).map((p) =>
    p.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "")
  );

  const isManagedFile = (relPath) =>
    targetPaths.some((prefix) => relPath === prefix || relPath.startsWith(prefix + "/"));

  return {
    name: "PruneUnusedAssets",
    async *emit(ctx, content) {
      const contentDir = ctx.argv.directory;
      const outputDir = ctx.argv.output;

      // 1. Alle Dateien in den überwachten Pfaden (z. B. src/) rekursiv einsammeln
      const managedFiles = [];
      for (const p of targetPaths) {
        managedFiles.push(...(await walkDir(path.join(contentDir, p), contentDir)));
      }
      if (managedFiles.length === 0) return;

      // Map der veröffentlichbaren Markdown-Seiten innerhalb von src/ (z. B. .excalidraw.md)
      const managedMarkdownMap = new Map();
      const rootPages = [];

      for (const item of content) {
        const [, vfile] = item;
        const relFile = path
          .relative(contentDir, String(vfile.data?.filePath ?? ""))
          .replace(/\\/g, "/");

        if (isManagedFile(relFile)) {
          const norm = normalizeKey(relFile);
          managedMarkdownMap.set(norm, item);
          managedMarkdownMap.set(norm.replace(/\.md$/i, ""), item);
        } else {
          rootPages.push(item);
        }
      }

      // 2. Erreichbarkeits-Suche (BFS) ab allen veröffentlichten Seiten außerhalb von src/
      const reachable = new Set();
      const queue = [...rootPages];
      const visitedPages = new Set();

      while (queue.length > 0) {
        const [tree, vfile] = queue.shift();
        const pageKey = String(vfile.data?.slug ?? vfile.data?.filePath ?? "");
        if (visitedPages.has(pageKey)) continue;
        visitedPages.add(pageKey);

        for (const target of extractTargets(tree, vfile)) {
          reachable.add(target);
          const linkedManagedPage = managedMarkdownMap.get(target);
          if (linkedManagedPage) {
            queue.push(linkedManagedPage);
          }
        }
      }

      // 3. Nicht referenzierte Dateien ermitteln
      const filesToPrune = managedFiles.filter((relFile) => {
        const norm = normalizeKey(relFile);
        const normNoMd = norm.replace(/\.md$/i, "");
        return !reachable.has(norm) && !reachable.has(normNoMd);
      });

      // Sofort in ignorePatterns eintragen, damit parallele Assets-Kopien übersprungen werden
      for (const relFile of filesToPrune) {
        if (!ctx.cfg.configuration.ignorePatterns.includes(relFile)) {
          ctx.cfg.configuration.ignorePatterns.push(relFile);
        }
      }

      // Kurz warten, falls der eingebaute Assets/ContentPage-Emitter parallel bereits geschrieben hat
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 4. Bereits geschriebene unbenutzte Dateien aus public/ löschen
      for (const relFile of filesToPrune) {
        const slugPath = normalizeKey(relFile);
        const candidates = [path.join(outputDir, slugPath)];

        if (slugPath.endsWith(".md")) {
          const base = slugPath.slice(0, -3);
          candidates.push(path.join(outputDir, `${base}.html`));
          candidates.push(path.join(outputDir, base, "index.html"));
        }

        for (const outFile of candidates) {
          await fs.promises.rm(outFile, { force: true });
        }
      }
    },
  };
};

export default PruneUnusedAssets;