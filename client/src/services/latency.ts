import { ConferenceApi } from "avcore/client/dist";
import { createContext } from "react";
import { observable, action, observe } from "mobx";
import { forEach } from "lodash";
import * as queryString from "query-string";
import * as io from "socket.io-client";
import * as shortId from "shortid";
import { API_OPERATION } from "avcore";

interface IPublishedStream {
  url: string;
  streamId: string;
  capture: unknown;
  worker: number;
}

class LatencyService {
  @observable servers: Array<string> = ["https://rpc.codeda.com"];

  @observable workers: Array<number> = [0]

  @observable kinds: Array<"video"|"audio"> = ["video"]

  @observable updated = false;

  @observable socket: SocketIOClient.Socket = null;

  @observable streamId: string = null;

  @observable capture = null;

  @observable playback = null;

  @observable incommingStream: MediaStream = null;

  @observable publishedStreams: Array<IPublishedStream> = [];

  constructor() {
    this.socket = io(`${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}`);
  }

  @action updateServersFromLocation = (searchString: string) => {
    const parsed = queryString.parse(searchString);

    forEach(parsed, (value, key) => {
      const parsedValue = typeof value === "string" ? value : value[0];

      if (key.match(/server/) && !this.servers.includes(parsedValue)) {
        this.servers.push(parsedValue);
      } else if (key.match(/worker/) && !this.workers.includes(Number(parsedValue))) {
        this.workers.push(Number(parsedValue));
      }
    });

    this.updated = true;
  }

  @action publishCanvas = async (mediaStream: MediaStream) => {
    this.servers.forEach((server) => {
      const streamId = shortId.generate();
      this.socket.emit("auth", { stream: streamId, operation: API_OPERATION.PUBLISH }, async (token: string) => {
        const capture = new ConferenceApi({
          kinds: this.kinds,
          url: server,
          worker: this.workers[0],
          stream: streamId,
          token,
        });

        await capture.publish(mediaStream);

        this.streamId = streamId;
        this.capture = capture;

        this.publishedStreams.push({
          streamId,
          url: server,
          capture,
          worker: this.workers[0],
        });
      });
    });
  }

  @action listenStream = async (stream: IPublishedStream) => {
    this.socket.emit("auth", { stream: stream.streamId, operation: API_OPERATION.SUBSCRIBE }, async (token: string) => {
      const playback = new ConferenceApi({
        kinds: this.kinds,
        url: stream.url,
        worker: stream.worker,
        stream: stream.streamId,
        token,
        origin: {
          url: stream.url,
          worker: stream.worker,
        },
      });

      this.incommingStream = await playback.subscribe();
      this.playback = playback;
    });
  }

  disposer = observe(this.publishedStreams, () => {
    this.listenStream(this.publishedStreams[0]);
  })
}

export const latencyService = createContext(new LatencyService());

// http://localhost:4000/latency?
