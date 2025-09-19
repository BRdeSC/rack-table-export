# Use uma imagem base do Node.js
FROM node:16-alpine as build

# Defina o diretório de trabalho
WORKDIR /app

# Copie o package.json e o package-lock.json e instale as dependências
COPY package*.json ./
RUN npm install

# Copie o restante do código da aplicação
COPY . .

# Crie a build de produção do React
RUN npm run build

# Use uma imagem leve para servir os arquivos estáticos (Nginx)
FROM nginx:alpine

# copia a configuração customizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie a build do React para o diretório do Nginx
COPY --from=build /app/build /usr/share/nginx/html/rack

# Expõe a porta que o Nginx usa
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]