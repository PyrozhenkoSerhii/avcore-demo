/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { Utils, ConferenceApi } from "avcore/client/dist";
import { createContext } from "react";
import { observable, action } from "mobx";
import * as io from "socket.io-client";
import * as shortId from "shortid";
import axios from "axios";
import { API_OPERATION, MediasoupSocketApi, MIXER_PIPE_TYPE } from "avcore";

import { conferenceConfig, mixerPipeFormats, mixerOptions } from "../config/stream";

class SocketService {
  @observable socket: SocketIOClient.Socket = null;

  @observable streamId: string = null;

  @observable mediaStream: MediaStream = null;

  @observable incommingStream: MediaStream = null;

  @observable hlsUrl: string = null;

  @observable hlsAvailable = false;

  @observable error: string = null;

  @observable conferenceConfig = conferenceConfig;

  @observable capture = null;

  @observable playback = null;

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

  @action changeServer = (serverUrl: string) => {
    this.conferenceConfig = {
      ...this.conferenceConfig,
      url: `https://${serverUrl}`,
    };
  }

  @action publishStream = async () => {
    if (this.mediaStream) {
      const streamId = shortId.generate();

      this.socket.emit("auth", { stream: streamId, operation: API_OPERATION.PUBLISH }, async (token: string) => {
        const capture = new ConferenceApi({
          ...this.conferenceConfig,
          stream: streamId,
          token,
        });

        await capture.publish(this.mediaStream);
        this.streamId = streamId;
        this.capture = capture;
      });
    }
  }

  @action stopPublishing = async () => {
    this.capture.close();
    this.streamId = null;
    this.mediaStream = await Utils.getUserMedia({ video: true, audio: true });

    if (this.playback) {
      this.playback.close();
      this.incommingStream = null;
    }
  }

  @action listenStream = async () => {
    this.socket.emit("auth", { stream: this.streamId, operation: API_OPERATION.SUBSCRIBE }, async (token: string) => {
      const playback = new ConferenceApi({
        ...this.conferenceConfig,
        stream: this.streamId,
        token,
      });

      this.incommingStream = await playback.subscribe();
      this.playback = playback;
    });
  }

  @action stopListening = async () => {
    this.playback.close();
    this.incommingStream = null;
  }

  @action checkUrl = async (url: string) => {
    try {
      await axios.get(url);
      this.hlsAvailable = true;
    } catch (err) {
      if (err.response.status === 404) {
        // eslint-disable-next-line no-console
        console.log("Hls video not available. Retring in 1 second");
        setTimeout(() => {
          this.checkUrl(url);
        }, 1000);
      } else {
        throw new Error(err);
      }
    }
  }

  @action mixerStart = async () => {
    this.socket.emit("auth", { stream: this.streamId, operation: API_OPERATION.MIXER }, async (token: string) => {
      try {
        const api = new MediasoupSocketApi(
          this.conferenceConfig.url,
          this.conferenceConfig.worker,
          token,
        );
        const { mixerId } = await api.mixerStart({
          height: mixerOptions.height,
          width: mixerOptions.width,
        });

        this.socket.emit("save_mixer", {
          streamId: this.streamId,
          mixerId,
          serverUrl: this.conferenceConfig.url,
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

        const url = `${this.conferenceConfig.url}/hls/${pipeId}/master.m3u8`;
        await this.checkUrl(url);

        this.hlsUrl = url;
      } catch (err) {
        this.error = err;
      }
    });
  }
}

const service = new SocketService();
service.init();
export const socketService = createContext(service);
