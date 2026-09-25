FROM node:22-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npx nx build frontend --configuration=production

FROM nginx:1.27-alpine AS runtime
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/apps/frontend/browser /usr/share/nginx/html
EXPOSE 80