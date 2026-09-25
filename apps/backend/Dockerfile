FROM node:22-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npx nx build backend --configuration=production

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist/apps/backend ./
RUN npm install --omit=dev && npm cache clean --force

USER node
EXPOSE 3000
CMD ["node", "main.js"]