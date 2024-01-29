FROM node:18.17.1
# Create app directory

WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json .

# Copy Prisma files
COPY prisma/ /usr/src/app/prisma/

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000

CMD [ "npm", "run","start" ]



