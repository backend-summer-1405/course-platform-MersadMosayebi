FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npm run build && npx prisma generate

EXPOSE 3001
CMD ["npm", "start"]
