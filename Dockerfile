#FROM node:20-alpine

#WORKDIR /app

#COPY package*.json ./
#RUN npm install

#COPY . .

#EXPOSE 3000

#CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

# Build
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]