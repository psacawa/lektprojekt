# lekt-frontend-image
from node:16 as builder
workdir /app
env NODE_ENV=production
copy yarn.lock package.json ./
run yarn install
copy . .
run yarn build

from nginx:1.21 

copy --from=builder /app/build /var/www/html/
copy default.conf /etc/nginx/conf.d/
