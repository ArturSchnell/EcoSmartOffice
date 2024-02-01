FROM node

WORKDIR /server

COPY package.json package.json
COPY nodemons.json nodemons.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .
CMD ["npm", "run", "dev"]