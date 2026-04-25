FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# Install serve globally
RUN npm install -g serve

EXPOSE 3000
CMD ["serve", "-s", "dist", "-p", "3000"]