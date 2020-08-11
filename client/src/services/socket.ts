/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createContext } from "react";
import { observable, action } from "mobx";

import * as io from "socket.io-client";
// TODO: types defenitions for avcore/client/dist
// @ts-ignore
import { Utils } from "avcore/client/dist";
import { API_OPERATION } from "avcore";

class SocketService {
  @observable socket: SocketIOClient.Socket = null;

  @observable token: string = null;

  @observable mediaStream: MediaStream = null;

  @observable error: string = null;

  constructor() {
    this.socket = io(`http://localhost:${process.env.PORT}`);
  }

  async init() {
    try {
      this.mediaStream = await Utils.getUserMedia({ video: true, audio: true });
    } catch (err) {
      this.error = err;
    }
  }

  @action auth = (path: string) => {
    this.socket.emit("auth", { stream: path, operation: API_OPERATION.PUBLISH }, async ({ token }: {token: string}) => {
      this.token = token;
    });
  }
}

export const socketService = createContext(new SocketService());
