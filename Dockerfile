FROM node:latest
RUN git clone https://github.com/jackyzha0/quartz.git /quartz
COPY ./quartz.config.ts /quartz/quartz.config.ts
WORKDIR /quartz

RUN npm install
RUN npx quartz create
EXPOSE 8080
ENV test true
CMD ["npx", "quartz", "build", "--serve"]