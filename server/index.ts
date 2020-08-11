import path from "path";
import express from "express";
import jwt from "jsonwebtoken";
import socketIO from "socket.io";

import {getExpiration} from "./utils/token";
import {ISocketAuth} from "./interfaces/socket";

const app = express();

const PORT = process.env.PORT;
const SECRET = process.env.SECRET;

app.use(express.static(path.join(__dirname, "../client/dist")));

const server = app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

const io = socketIO(server);

io.on("connection", (socket) => {
  console.log("Socket connection was established");
  socket.on("auth", ({stream, operation}, callback) => {
    const token = jwt.sign({stream, operation}, SECRET, {expiresIn: getExpiration(), algorithm: "HS512"});     
    callback({token});
  });
});
