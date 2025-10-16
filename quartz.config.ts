import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
    configuration: {
        pageTitle: process.env.PAGE_TITLE ?? "Quartz 4",
        pageTitleSuffix: process.env.PAGE_TITLE_SUFFIX ?? "",
        enableSPA: process.env.ENABLE_SPA == "true" ? true : false,
        enablePopovers: process.env.ENABLE_POPOVERS == "true" ? true : false,
        analytics: {
            provider: "plausible",
        },
        locale: (process.env.locale) as any ?? "en-US",
        baseUrl: process.env.BASE_URL ?? "quartz.jzhao.xyz",
        ignorePatterns: process.env.IGNORE_PATTERNS ? process.env.IGNORE_PATTERNS.split(",") : ["private", "templates", ".obsidian"],
        defaultDateType: (process.env.DEFAULT_DATE_TYPE) as any ?? "modified",
        theme: {
            fontOrigin: (process.env.FONT_ORIGIN) as any ?? "googleFonts",
            cdnCaching: true,
            typography: {
                header: process.env.TYPOGRAPHY_HEADER ?? "Schibsted Grotesk",
                body: process.env.TYPOGRAPHY_BODY ?? "Source Sans Pro",
                code: process.env.TYPOGRAPHY_CODE ?? "IBM Plex Mono",
            },
            colors: {
                lightMode: {
                    light: process.env.LIGHT_MODE_LIGHT ?? "#faf8f8",
                    lightgray: process.env.LIGHT_MODE_LIGHTGRAY ?? "#e5e5e5",
                    gray: process.env.LIGHT_MODE_GRAY ?? "#b8b8b8",
                    darkgray: process.env.LIGHT_MODE_DARKGRAY ?? "#4e4e4e",
                    dark: process.env.LIGHT_MODE_DARK ?? "#2b2b2b",
                    secondary: process.env.LIGHT_MODE_SECONDARY ?? "#284b63",
                    tertiary: process.env.LIGHT_MODE_TERTIARY ?? "#84a59d",
                    highlight: process.env.LIGHT_MODE_HIGHLIGHT ?? "rgba(143, 159, 169, 0.15)",
                    textHighlight: "#fff23688",
                },
                darkMode: {
                    light: process.env.DARK_MODE_LIGHT ?? "#161618",
                    lightgray: process.env.DARK_MODE_LIGHTGRAY ?? "#393639",
                    gray: process.env.DARK_MODE_GRAY ?? "#646464",
                    darkgray: process.env.DARK_MODE_DARKGRAY ?? "#d4d4d4",
                    dark: process.env.DARK_MODE_DARK ?? "#ebebec",
                    secondary: process.env.DARK_MODE_SECONDARY ?? "#7b97aa",
                    tertiary: process.env.DARK_MODE_TERTIARY ?? "#84a59d",
                    highlight: process.env.DARK_MODE_HIGHLIGHT ?? "rgba(143, 159, 169, 0.15)",
                    textHighlight: process.env.DARK_MODE_TEXT_HIGHLIGHT ?? "#b3aa0288",
                },
            },
        },
    },
    plugins: {
        transformers: [
            Plugin.FrontMatter(),
            Plugin.CreatedModifiedDate({
                priority: ["frontmatter", "git", "filesystem"],
            }),
            Plugin.SyntaxHighlighting({
                theme: {
                    light: "github-light",
                    dark: "github-dark",
                },
                keepBackground: false,
            }),
            Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
            Plugin.GitHubFlavoredMarkdown(),
            Plugin.TableOfContents(),
            Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
            Plugin.Description(),
            Plugin.Latex({ renderEngine: "katex" }),
            Plugin.excalidrawToSvg(),
        ],
        filters: [Plugin.RemoveDrafts()],
        emitters: [
            Plugin.AliasRedirects(),
            Plugin.ComponentResources(),
            Plugin.ContentPage(),
            Plugin.FolderPage(),
            Plugin.TagPage(),
            Plugin.ContentIndex({
                enableSiteMap: true,
                enableRSS: true,
            }),
            Plugin.Assets(),
            Plugin.Static(),
            Plugin.Favicon(),
            Plugin.NotFoundPage(),
            // Comment out CustomOgImages to speed up build time
            //Plugin.CustomOgImages(),
        ],
    },
}

export default config
