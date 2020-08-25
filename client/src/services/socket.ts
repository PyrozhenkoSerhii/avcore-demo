import { Utils, ConferenceApi } from "avcore/client/dist";
import { createContext } from "react";
import { observable, action } from "mobx";
import * as io from "socket.io-client";
import * as shortId from "shortid";
import axios from "axios";
import { API_OPERATION, MediasoupSocketApi, MIXER_PIPE_TYPE } from "avcore";

import { conferenceConfig, mixerPipeFormats, mixerOptions } from "../config/stream";

class SocketService {
  @observable publishDisabled = true;

  @observable listenRTCDisabled = true;

  @observable listenHLSDisabled = true;

  @observable socket: SocketIOClient.Socket = null;

  @observable streamId: string = null;

  @observable mediaStream: MediaStream = null;

  @observable incommingStream: MediaStream = null;

  @observable mixerId: string = null;

  @observable hlsUrlRetryTimer = null;

  @observable hlsUrl: string = null;

  @observable hlsAvailable = false;

  @observable conferenceConfig = conferenceConfig;

  @observable capture = null;

  @observable playback = null;

  constructor() {
    this.socket = io(`${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}`);
  }

  async init() {
    try {
      this.mediaStream = await Utils.getUserMedia({ video: true, audio: true });
      this.publishDisabled = false;
    } catch (err) {
      console.log("Error occured while requesting user media: ", err);
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
      try {
        this.publishDisabled = true;
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

          this.listenHLSDisabled = false;
          this.listenRTCDisabled = false;
        });
      } catch (err) {
        console.log("Error occured while publishing stream: ", err);
      } finally {
        this.publishDisabled = false;
      }
    }
  }

  @action stopPublishing = async (reinitMedia = true) => {
    this.publishDisabled = true;

    if (this.playback) {
      this.stopListeningWebRTC();
    }

    if (this.mixerId && this.hlsUrl) {
      this.stopListeningHLS();
    }

    if (this.capture) {
      this.capture.close();
    }

    this.streamId = null;
    if (reinitMedia) {
      try {
        this.mediaStream = await Utils.getUserMedia({ video: true, audio: true });
      } catch (err) {
        console.log("Error occured while requesting user media: ", err);
      }
    }

    this.publishDisabled = false;
    this.listenHLSDisabled = true;
    this.listenRTCDisabled = true;
  }

  @action listenStreamWebRTC = async () => {
    try {
      this.listenRTCDisabled = true;
      this.socket.emit("auth", { stream: this.streamId, operation: API_OPERATION.SUBSCRIBE }, async (token: string) => {
        const playback = new ConferenceApi({
          ...this.conferenceConfig,
          stream: this.streamId,
          token,
        });

        this.incommingStream = await playback.subscribe();
        this.playback = playback;
      });
    } catch (err) {
      console.log("Error occured while subscribing to WebRTC stream: ", err);
    } finally {
      this.listenRTCDisabled = false;
    }
  }

  @action stopListeningWebRTC = async () => {
    this.playback.close();
    this.incommingStream = null;
  }

  @action checkUrl = async (url: string) => {
    try {
      await axios.get(url);
      this.hlsAvailable = true;
      this.listenHLSDisabled = false;
    } catch (err) {
      if (err.response.status === 404) {
        console.log("Hls video not available. Retring in 1 second");
        this.hlsUrlRetryTimer = setTimeout(() => {
          this.checkUrl(url);
        }, 1000);
      } else {
        throw new Error(err);
      }
    }
  }

  @action listenStreamHLS = async () => {
    this.listenHLSDisabled = true;
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
        this.mixerId = mixerId;
      } catch (err) {
        console.log("Error occured while subscribing to HLS stream: ", err);
      } finally {
        this.listenHLSDisabled = false;
      }
    });
  }

  @action stopListeningHLS = () => {
    this.socket.emit("auth", { stream: this.streamId, operation: API_OPERATION.MIXER }, async (token: string) => {
      if (this.mixerId) {
        const api = new MediasoupSocketApi(
          this.conferenceConfig.url,
          this.conferenceConfig.worker,
          token,
        );

        api.mixerClose({ mixerId: this.mixerId });

        if (this.hlsUrlRetryTimer) {
          clearTimeout(this.hlsUrlRetryTimer);
          this.hlsUrlRetryTimer = null;
        }

        this.hlsUrl = null;
        this.hlsAvailable = false;
        this.mixerId = null;
      }
    });
  }

  @action close = () => {
    this.stopPublishing(false);
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }
}

const service = new SocketService();

export const socketService = createContext(service);
