FROM node:8.11.1
MAINTAINER notary

WORKDIR /var/www/turbo-ugc

COPY ./package.json /var/www/turbo-ugc
COPY ./package-lock.json /var/www/turbo-ugc

RUN npm install
RUN npm run build

ADD . /var/www/turbo-ugc

CMD npm start

EXPOSE 9008
