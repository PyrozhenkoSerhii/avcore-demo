# Installation
## Dev mode
Create `.env` file and enter environment variables that is used in `/server/config/default.js` as it's done in `.env-sample` 
```bash
cd server
touch .env
```

Generate certificates and key for HTTPS, for example through openssl: https://slproweb.com/products/Win32OpenSSL.html
In `/server/ssl` folder
```bash
mkdir ssl && cd $_
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem
```

Add valid ssh key to your git to access `avcore` lib

Install dependencies
```bash
npm i -g typescript pm2
cd server
npm i
cd ../client
npm i
```
## Production mode
Create `.env` file and enter environment variables that is used in `/server/config/production.js` as it's done in `.env-sample` 
```bash
cd server
touch .env
```

Generate certificates for your server with certbot.js
```bash
sudo apt-get update
sudo apt-get install -y software-properties-common
sudo add-apt-repository universe
sudo add-apt-repository -y ppa:certbot/certbot
sudo apt-get update
sudo apt-get install -y certbot
certbot certonly -d app.example.com --non-interactive --standalone --agree-tos \
--email youremail@example.com
```

Install dependencies
```bash
npm i -g typescript pm2
cd server
npm i
cd ../client
npm i
```

# Execution
## Development mode
Run client in a development mode
```bash
cd client
npm run dev
```
or build client to use it as a static file in Node.js server
```bash
cd client
npm run build
```
You have two options to run server in a development mode: 
- nodemon
```bash
cd server
npm run dev
```
- pm2 dev configuration with watcher enabled
```bash
cd server
npm run pm2:dev
```
## Production mode
Build client
```bash
cd client
npm run build
```
Two options to run Node.js server
- ts-node
```bash
cd server
npm run prod
```
- pm2
```bash
cd server
npm run build
npm run pm2:prod
```







