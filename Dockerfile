FROM node:alpine
WORKDIR /cronflow
COPY package.json .
RUN npm run taobao
COPY . .
CMD ["node", "dist/index.js"]