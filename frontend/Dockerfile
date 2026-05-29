FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN rm -rf node_modules

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY --from=0 /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
