import dotenv from "dotenv";
dotenv.config();

import config from "config";
import cors from "cors";
import {createServer} from "https";
import fs from "fs";
import path from "path";
import express from "express";
import jwt from "jsonwebtoken";
import socketIO from "socket.io";
import { MediasoupSocketApi, API_OPERATION } from "avcore";

import { getExpiration } from "./utils/token";
import { IExtSocket, TOnAuthProps, TOnSaveMixerProps, TOnAuthCallback } from "./interfaces/socket";


const PORT = Number(process.env.PORT);
const SECRET = process.env.SECRET;

const privateKey = fs.readFileSync(config.get("privateKey"), "utf8");
const certificate = fs.readFileSync(config.get("certificate"), "utf8");
const ca = fs.readFileSync(config.get("ca"), "utf8");

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

const app = express();

const clientDistFolder = process.env.FROM_BUILD ? "../../client/dist" : "../client/dist";

const httpsServer = createServer(credentials, app);

// const io = socketIO(httpsServer);

// io.on("connection", (socket: IExtSocket) => {
//   console.log("> Socket connection was established");

//   socket.on("auth", (data: TOnAuthProps, callback: TOnAuthCallback) => {
//     const {operation, stream} = data;
//     const token = jwt.sign({ stream, operation }, SECRET, { expiresIn: getExpiration(), algorithm: "HS512" });

//     console.log(`> Created token for stream: ${stream}, operation: ${operation}`);

//     callback(token);
//   });

//   socket.on("save_mixer", (data: TOnSaveMixerProps) => {
//     const { mixerId, serverUrl, streamId } = data;

//     socket.mixerId = mixerId;
//     socket.streamId = streamId;
//     socket.serverUrl = serverUrl;
//   });

//   socket.on("disconnect", () => {
//     console.log("> Socket got disconnected!");

//     if(socket.mixerId) {
//       console.log("> Closing the mixer...");
//       const token = jwt.sign(
//         { stream: socket.streamId, operation: API_OPERATION.MIXER },
//         SECRET,
//         { expiresIn: getExpiration(), algorithm: "HS512" });
  
//       const api = new MediasoupSocketApi(socket.serverUrl, 0, token);
  
//       api.mixerClose({ mixerId:socket.mixerId });
//     }
//   });
// });


httpsServer.listen(PORT, () => {
  console.log(`> HTTPS Server running on port ${PORT}`);
});

app.use(cors());
app.use(express.static(path.join(__dirname, clientDistFolder)));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, clientDistFolder, "index.html"));
});