FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
COPY package-lock.json* ./
RUN npm install

# Copy app
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"] 