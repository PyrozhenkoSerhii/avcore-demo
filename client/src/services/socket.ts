/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createContext } from "react";
import { observable, action } from "mobx";
import * as io from "socket.io-client";

// TODO: types definitions for avcore/client/dist
// @ts-ignore
import { Utils, ConferenceApi } from "avcore/client/dist";
import { API_OPERATION } from "avcore";

import { conferenceConfig } from "../config/stream";

class SocketService {
  @observable socket: SocketIOClient.Socket = null;

  @observable token: string = null;

  @observable streamId: string = null;

  @observable mediaStream: MediaStream = null;

  @observable incommingStream: MediaStream = null;

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
      this.streamId = path;
    });
  }

  @action publishStream = async (streamId: string) => {
    if (this.mediaStream) {
      this.socket.emit("auth", { stream: streamId, operation: API_OPERATION.PUBLISH }, async ({ token }: {token: string}) => {
        const capture = new ConferenceApi({
          ...conferenceConfig,
          stream: streamId,
          token,
        });

        await capture.publish(this.mediaStream);
      });
    }
  }

  @action listenStream = async (streamId: string) => {
    this.socket.emit("auth", { stream: streamId, operation: API_OPERATION.SUBSCRIBE }, async ({ token }: {token: string}) => {
      const playback = new ConferenceApi({
        ...conferenceConfig,
        stream: streamId,
        token,
      });

      this.incommingStream = await playback.subscribe();
    });
  }
}

export const socketService = createContext(new SocketService());
