export const DataviewJS = (userOpts) => {
  const proxyUrl = userOpts?.proxyUrl ?? "https://api.allorigins.win/raw?url=";

  const clientScript = `
    const PROXY_URL = ${JSON.stringify(proxyUrl)};
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

    const fakeRequire = (mod) => {
      if (mod === "obsidian") {
        return {
          requestUrl: async ({ url }) => {
            const res = await fetch(PROXY_URL + encodeURIComponent(url));
            if (!res.ok) throw new Error("HTTP " + res.status);
            return { text: await res.text() };
          },
        };
      }
      throw new Error("Modul nicht unterstützt: " + mod);
    };

    document.addEventListener("nav", () => {
      const blocks = document.querySelectorAll(
        'pre[data-language="dataviewjs"], pre:has(> code[data-language="dataviewjs"]), pre:has(> code.language-dataviewjs)'
      );

      blocks.forEach(async (pre) => {
        const codeEl = pre.querySelector("code") ?? pre;
        const code = codeEl.textContent ?? "";

        const container = document.createElement("div");
        container.className = "dataviewjs-live-output";

        const wrapper =
          pre.parentElement?.tagName === "FIGURE" ? pre.parentElement : pre;
        wrapper.replaceWith(container);

        const dv = {
          paragraph: (text) => {
            const p = document.createElement("p");
            p.textContent = String(text);
            container.appendChild(p);
          },
          header: (level, text) => {
            const h = document.createElement("h" + level);
            h.textContent = String(text);
            container.appendChild(h);
          },
        };

        try {
          const run = new AsyncFunction("dv", "require", code);
          await run(dv, fakeRequire);
        } catch (err) {
          dv.paragraph("Fehler: " + err.message);
        }
      });
    });
  `;

  return {
    name: "LiveDataviewJS",
    externalResources() {
      return {
        js: [
          {
            script: clientScript,
            loadTime: "afterDOMReady",
            contentType: "inline",
          },
        ],
      };
    },
  };
};

export default DataviewJS;