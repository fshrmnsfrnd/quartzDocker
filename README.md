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
            - "<port>:8080"
        volumes:
            - "<your_local_path_to_md_files>:/quartz/content/"
        environment:
            - PAGE_TITLE=Quartz 4
```

## Run:
```
docker pull
docker compose up -d
```

## Configuration
The variables in the `quartz.config.ts` file can be configured via environment variables in the `docker-compose.yml`
