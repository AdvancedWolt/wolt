FROM node:20-alpine AS client-builder

WORKDIR /client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY web/package*.json ./
RUN npm install --omit=dev
COPY web/src ./src
COPY --from=client-builder /client/dist ./public

EXPOSE 3000

CMD ["npm", "run", "start"]
