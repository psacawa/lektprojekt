# lektprojekt-frontend-image
from node:16 as builder
workdir /app
copy yarn.lock package.json ./
run --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install
# run yarn install
copy . .
run yarn build

from nginx:1.21 

copy --from=builder /app/build /usr/share/nginx/html
