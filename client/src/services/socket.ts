/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { Utils, ConferenceApi } from "avcore/client/dist";
import { createContext } from "react";
import { observable, action } from "mobx";
import * as io from "socket.io-client";
import * as shortId from "shortid";
import { API_OPERATION } from "avcore";

import { conferenceConfig } from "../config/stream";

class SocketService {
  @observable socket: SocketIOClient.Socket = null;

  @observable streamId: string = null;

  @observable mediaStream: MediaStream = null;

  @observable incommingStream: MediaStream = null;

  @observable error: string = null;

  constructor() {
    this.socket = io(`${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}`);
  }

  async init() {
    try {
      this.mediaStream = await Utils.getUserMedia({ video: true, audio: true });
    } catch (err) {
      this.error = err;
    }
  }

  @action publishStream = async () => {
    if (this.mediaStream) {
      const streamId = shortId.generate();

      this.socket.emit("auth", { stream: streamId, operation: API_OPERATION.PUBLISH }, async ({ token }: {token: string}) => {
        const capture = new ConferenceApi({
          ...conferenceConfig,
          stream: streamId,
          token,
        });

        this.streamId = streamId;
        await capture.publish(this.mediaStream);
      });
    }
  }

  @action listenStream = async () => {
    this.socket.emit("auth", { stream: this.streamId, operation: API_OPERATION.SUBSCRIBE }, async ({ token }: {token: string}) => {
      const playback = new ConferenceApi({
        ...conferenceConfig,
        stream: this.streamId,
        token,
      });

      this.incommingStream = await playback.subscribe();
    });
  }
}

const service = new SocketService();
service.init();
export const socketService = createContext(service);
