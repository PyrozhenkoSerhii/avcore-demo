module.exports = {
  host: process.env.HOST,
  port: process.env.PORT,
  protocol: process.env.PROTOCOL,
  secret: process.env.SECRET,
  privateKey: "/etc/letsencrypt/live/app.avcore.io/privkey.pem",
  certificate: "/etc/letsencrypt/live/app.avcore.io/cert.pem",
  ca: "/etc/letsencrypt/live/app.avcore.io/chain.pem",
};