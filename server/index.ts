import path from "path";
import express from "express";
import jwt from "jsonwebtoken";
import socketIO from "socket.io";
import { MediasoupSocketApi, API_OPERATION } from "avcore";

import { getExpiration } from "./utils/token";

import { IExtSocket, TOnAuthProps, TOnSaveMixerProps, TOnAuthCallback } from "./interfaces/socket";

const app = express();

const PORT = Number(process.env.PORT);
const HOST = process.env.HOST;
const SECRET = process.env.SECRET;

app.use(express.static(path.join(__dirname, "../client/dist")));

const server = app.listen(PORT, HOST, () => {
  console.log(`> Server is listening on ${HOST}:${PORT}`);
});

const io = socketIO(server);

io.on("connection", (socket: IExtSocket) => {
  console.log("> Socket connection was established");

  socket.on("auth", (data: TOnAuthProps, callback: TOnAuthCallback) => {
    const {operation, stream} = data;
    const token = jwt.sign({ stream, operation }, SECRET, { expiresIn: getExpiration(), algorithm: "HS512" });

    console.log(`> Created token for stream: ${stream}, operation: ${operation}`);

    callback(token);
  });

  socket.on("save_mixer", (data: TOnSaveMixerProps) => {
    const { mixerId, serverUrl, streamId } = data;

    socket.mixerId = mixerId;
    socket.streamId = streamId;
    socket.serverUrl = serverUrl;
  });

  socket.on("disconnect", () => {
    console.log("> Socket got disconnected!");

    if(socket.mixerId) {
      console.log("> Closing the mixer...");
      const token = jwt.sign(
        { stream: socket.streamId, operation: API_OPERATION.MIXER },
        SECRET,
        { expiresIn: getExpiration(), algorithm: "HS512" });
  
      const api = new MediasoupSocketApi(socket.serverUrl, 0, token);
  
      api.mixerClose({ mixerId:socket.mixerId });
    }
  });
});
