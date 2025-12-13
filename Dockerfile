#FROM node:20-alpine AS base

#WORKDIR /app

#COPY package*.json ./
#RUN npm install

#COPY . .

#EXPOSE 5173

#CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "3000"]

#CMD ["npm", "run", "dev",]

# Etapa 1: Build com Node.js
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Etapa 2: Servir com NGINX
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]