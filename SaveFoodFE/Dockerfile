FROM node:18.17.0 AS development

WORKDIR /app
COPY . .

RUN npm install --force
RUN npm install @types/react-modal --force
RUN npm install quagga --force
RUN npm run build --force

EXPOSE 3000
CMD ["npm", "run", "start"]