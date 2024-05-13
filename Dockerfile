# Dockerfile
FROM node:latest as build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps 

COPY .env* ./

COPY . .
RUN npm run build

# Nginx stage
FROM nginx:stable-alpine as production
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
