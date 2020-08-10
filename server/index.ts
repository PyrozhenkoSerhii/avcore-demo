/* eslint-disable @typescript-eslint/no-var-requires */
import {createServer} from "http";
import path from "path";
import express from "express";
import jwt from "jsonwebtoken";

import {getExpiration} from "./utils/token";

const app = express();

const PORT = process.env.PORT;
const SECRET = process.env.SECRET;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

const httpServer = createServer(app);
httpServer.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

const io = require("socket.io")(httpServer);

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("auth", ({stream, operation}, callback) => {
    const token = jwt.sign({stream, operation}, SECRET, {expiresIn: getExpiration(), algorithm: "HS512"});     
    console.log("token created"); 
    callback({token});
  });
});
