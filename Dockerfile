FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist ./dist
COPY LICENSE ./
ENTRYPOINT ["node", "dist/index.js"]
