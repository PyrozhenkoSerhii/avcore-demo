module.exports = {
  host: "localhost",
  port: "443",
  protocol: "https",
  secret: process.env.SECRET,
  privateKey: "./key.pem",
  certificate: "./cert.pem",
  ca: "./csr.pem",
};