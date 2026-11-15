FROM node:22-slim

# Nur einmal apt-get ausführen
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# 1. NUR Dateien kopieren, die für die Installation nötig sind (Cache-Optimierung)
COPY package.json ./
COPY package-lock.json* ./
COPY .npmrc* ./
COPY quartz/ ./quartz/
COPY quartz.lock.json* ./
COPY quartz.config.yaml ./

# 2. Abhängigkeiten und Plugins installieren
RUN npm install
RUN npx quartz plugin install --from-config

# 3. Erst JETZT den Rest (quartz Ordner, content, etc.) kopieren
COPY . .

CMD ["npx", "quartz", "build"]