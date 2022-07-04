FROM ubuntu:latest

WORKDIR /usr/src/app/

COPY package.json .

RUN apt-get update

RUN apt-get -y install curl unzip

RUN curl -sL https://deb.nodesource.com/setup_18.x | bash

RUN apt-get -qq -y install make autoconf automake g++ libtool nodejs

RUN npm install

COPY . .

RUN chmod +x ./build-and-test.sh

EXPOSE 8081

ENTRYPOINT [ "npm", "run", "start" ]
