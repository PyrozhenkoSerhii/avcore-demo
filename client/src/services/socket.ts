/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { Utils, ConferenceApi } from "avcore/client/dist";
import { createContext } from "react";
import { observable, action } from "mobx";
import * as io from "socket.io-client";
import * as shortId from "shortid";
import { API_OPERATION, MediasoupSocketApi, MIXER_PIPE_TYPE } from "avcore";

import { conferenceConfig, mixerPipeFormats, mixerOptions } from "../config/stream";

class SocketService {
  @observable socket: SocketIOClient.Socket = null;

  @observable streamId: string = null;

  @observable mediaStream: MediaStream = null;

  @observable incommingStream: MediaStream = null;

  @observable hlsUrl: string = null;

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

      this.socket.emit("auth", { stream: streamId, operation: API_OPERATION.PUBLISH }, async (token: string) => {
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
    this.socket.emit("auth", { stream: this.streamId, operation: API_OPERATION.SUBSCRIBE }, async (token: string) => {
      const playback = new ConferenceApi({
        ...conferenceConfig,
        stream: this.streamId,
        token,
      });

      this.incommingStream = await playback.subscribe();
    });
  }

  @action mixerStart = async () => {
    this.socket.emit("auth", { stream: this.streamId, operation: API_OPERATION.MIXER }, async (token: string) => {
      try {
        const api = new MediasoupSocketApi(conferenceConfig.url, conferenceConfig.worker, token);
        const { mixerId } = await api.mixerStart({});

        this.socket.emit("save_mixer", {
          streamId: this.streamId,
          mixerId,
          serverUrl: conferenceConfig.url,
        });

        const videoMixer = api.mixerAdd({
          mixerId,
          kind: "video",
          stream: this.streamId,
          options: mixerOptions,
        });

        const audioMixer = api.mixerAdd({
          mixerId,
          kind: "audio",
          stream: this.streamId,
        });

        await videoMixer;
        await audioMixer;

        const { pipeId } = await api.mixerPipeStart({
          mixerId,
          kinds: ["audio", "video"],
          type: MIXER_PIPE_TYPE.HLS,
          formats: mixerPipeFormats,
        });

        this.hlsUrl = `${conferenceConfig.url}/hls/${pipeId}/master.m3u8`;
      } catch (err) {
        this.error = err;
      }
    });
  }
}

const service = new SocketService();
service.init();
export const socketService = createContext(service);
