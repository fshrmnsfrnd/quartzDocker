# quartzDocker

Docker Hub: https://hub.docker.com/r/fshrmnsfrnd/quartz/

## Docker Compose
Prefered way to run this Docker is docker-compose
```
services:
    quartz:
        name: quartz
        image: fshrmnsfrnd/quartz
        ports:
            - <port>:8080
        volumes:
            - <your_local_path_to_md_files>:/usr/src/app/content/
        environment:
            - PAGE_TITLE="Nico's Garden"
            - PAGE_TITLE_SUFFIX=""
            - ENABLE_SPA="true"
            - ENABLE_POPOVERS="true"
            - BASE_URL=garden.fshrmnsfrnd.ddnss.de
            - IGNORE_PATTERNS=["private", "templates", ".obsidian"]
            - DEFAULT_DATE_TYPE="modified"
            - FONT_ORIGIN="googleFonts"
            - TYPOGRAPHY_HEADER="Schibsted Grotesk"
            - TYPOGRAPHY_BODY="Source Sans Pro"
            - TYPOGRAPHY_CODE="IBM Plex Mono"
            - LIGHT_MODE_LIGHT="#faf8f8"
            - LIGHT_MODE_LIGHTGRAY="#e5e5e5"
            - LIGHT_MODE_GRAY="#b8b8b8"
            - LIGHT_MODE_DARKGRAY="#4e4e4e"
            - LIGHT_MODE_DARK="#2b2b2b"
            - LIGHT_MODE_SECONDARY="#284b63"
            - LIGHT_MODE_TERTIARY="#84a59d"
            - LIGHT_MODE_TEXT_HIGHLIGHT="#fff23688"
            - DARK_MODE_LIGHT="#161618"
            - DARK_MODE_LIGHTGRAY="#393639"
            - DARK_MODE_GRAY="#646464"
            - DARK_MODE_DARKGRAY="#d4d4d4"
            - DARK_MODE_DARK="#ebebec"
            - DARK_MODE_SECONDARY="#7b97aa"
            - DARK_MODE_TERTIARY="#84a59d"
            - DARK_MODE_TEXT_HIGHLIGHT="#b3aa0288"
```

## Run:
```
docker pull
docker compose up -d
```

## Configuration
The variables in the `quartz.config.ts` file can be configured via environment variables in the `docker-compose.yml`
