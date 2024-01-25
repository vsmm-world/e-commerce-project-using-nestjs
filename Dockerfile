FROM node:v20.10.0

WORKDIR /user/scr/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

