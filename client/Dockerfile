FROM node

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .

ENV HOST=0.0.0.0
EXPOSE 5173
CMD ["npm","run", "dev","--", "--host", "0.0.0.0"]