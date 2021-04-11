FROM node:latest as client

WORKDIR /code
COPY package.json . 
RUN npm install --legacy-peer-deps
copy . .
RUN npm run build

FROM nginx:latest

RUN apt update && apt install -y vim 

COPY --from=client /code/build /var/www/html
RUN rm /etc/nginx/conf.d/default.conf
EXPOSE 80
