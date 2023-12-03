FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies
RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run", "start-prod"]
