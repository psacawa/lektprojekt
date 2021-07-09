# lekt-frontend-image
from node:16 as builder
workdir /app
copy yarn.lock package.json ./
run yarn install
# run yarn install
copy . .
run yarn build

from nginx:1.21 

copy --from=builder /app/build /usr/share/nginx/html
