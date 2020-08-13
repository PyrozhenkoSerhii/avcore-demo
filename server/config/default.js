module.exports = {
  host: "localhost",
  port: "443",
  protocol: "https",
  secret: process.env.SECRET,
  privateKey: "./ssl/key.pem",
  certificate: "./ssl/cert.pem",
  ca: "./ssl/csr.pem",
};