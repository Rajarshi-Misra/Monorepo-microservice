FROM node:20-alpine

WORKDIR /app

COPY ../../common ./common
COPY . .

RUN npm install

RUN npm run --workspace=common build && npm run --workspace=services/service-a build

CMD ["npm", "run", "--workspace=services/service-a", "start"]

EXPOSE 3001