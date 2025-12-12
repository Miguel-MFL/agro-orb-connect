#FROM node:20-alpine

#WORKDIR /app

#COPY package*.json ./
#RUN npm install

#COPY . .

#EXPOSE 3000

#CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

# Dockerfile para produção
FROM node:20-alpine AS builder

WORKDIR /app

# Copia arquivos de dependência
COPY package.json package-lock.json* ./

# Instala dependências (incluindo devDependencies, necessárias para build)
RUN npm ci
RUN npm install 

# Copia código-fonte
COPY . .

# Faz o build da aplicação
RUN npm run build

# ---- Fase final (leve e segura) ----
FROM node:20-alpine

WORKDIR /app

# Instala APENAS dependências de produção (inclui "serve")
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Copia os arquivos estáticos do build
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Usa o servidor de produção
CMD ["npm", "start"]
