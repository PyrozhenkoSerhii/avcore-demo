import path from "path";
import express from "express";
import jwt from "jsonwebtoken";
import socketIO from "socket.io";

import {getExpiration} from "./utils/token";

const app = express();

const PORT = Number(process.env.PORT);
const HOST = process.env.HOST;
const SECRET = process.env.SECRET;

app.use(express.static(path.join(__dirname, "../client/dist")));

const server = app.listen(PORT, HOST, () => {
  console.log(`Server is listening on ${HOST}:${PORT}`);
});

const io = socketIO(server);

io.on("connection", (socket) => {
  console.log("Socket connection was established");
  socket.on("auth", ({stream, operation}, callback) => {
    const token = jwt.sign({stream, operation}, SECRET, {expiresIn: getExpiration(), algorithm: "HS512"});     
    callback({token});
  });
});
