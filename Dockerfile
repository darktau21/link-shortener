FROM node:22 AS development

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma

RUN npm ci
RUN npm run prisma:generate
COPY . .


FROM node:22 AS build

WORKDIR /app

COPY package*.json ./

COPY --from=development /app/node_modules ./node_modules

COPY . .

RUN npm run build
ENV NODE_ENV production

RUN npm ci --only=production && npm cache clean --force


FROM node:22 AS production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

CMD [ "node", "dist/main.js" ]