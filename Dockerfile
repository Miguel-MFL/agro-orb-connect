#FROM node:20-alpine

#WORKDIR /app

#COPY package*.json ./
#RUN npm install

#COPY . .

#EXPOSE 3000

#CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

# Build
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Instala o serve globalmente
RUN npm install -g serve

COPY . .

RUN npm run build

# Inicia o servidor serve
CMD ["serve", "-s", "dist", "-l", "3000"]