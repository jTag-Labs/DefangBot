FROM node:20.12.0

WORKDIR /app

COPY ./app/package.json /app/package.json
COPY ./app/yarn.lock /app/yarn.lock

RUN yarn install

COPY ./app /app

RUN yarn build

CMD ["yarn", "start"]