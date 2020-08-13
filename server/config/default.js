module.exports = {
  host: "localhost",
  port: "443",
  protocol: "https",
  secure: true,
  secret: process.env.SECRET,
  privateKey: "./key.pem",
  certificate: "./cert.pem",
  ca: "./csr.pem",
};