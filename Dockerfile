FROM node:20.19.1-alpine

WORKDIR /app

RUN npm install -g pm2

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production --silent

COPY . .

EXPOSE 3055

CMD ["npm", "run", "start"]