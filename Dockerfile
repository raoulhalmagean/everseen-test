FROM node:20-alpine

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

USER node

COPY  --chown=node:node everseen13.js in1.log in2.log ./

EXPOSE 3000

CMD [ "node", "everseen13.js" ]