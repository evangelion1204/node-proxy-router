FROM node:4.2.2

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ADD . /usr/src/app/
RUN npm install

EXPOSE 3001 3002 3003 3004 3005

ENTRYPOINT ["npm"]
CMD ["npm run start-router"]