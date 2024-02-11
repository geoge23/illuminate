FROM node:lts-alpine

# Create app directory
WORKDIR /usr/src/app

COPY . .
RUN cd frontend && npm install && npm run build

RUN cd backend && npm install

EXPOSE 3000

CMD ["node", "backend/index.js"]