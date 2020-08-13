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

# Execution
## Development mode
```bash
cd client
npm run dev
```
In separate terminal/console
```bash
cd server
npm run dev
```
## Production mode
```bash
cd client
npm run build
cd ../server
npm run prod
```






