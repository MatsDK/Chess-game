FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8000
EXPOSE 8001
CMD [ "node", "dist/index.js" ]
