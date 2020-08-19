import { ConferenceApi } from "avcore/client/dist";
import { createContext } from "react";
import { observable, action } from "mobx";
import { forEach } from "lodash";
import * as queryString from "query-string";
import * as io from "socket.io-client";
import * as shortId from "shortid";
import { API_OPERATION } from "avcore";

interface IPublishedStream {
  url: string;
  streamId: string;
  capture: ConferenceApi;
  worker: number;
}

interface ISubscribedStream {
  url: string;
  worker: number;
  streamId: string;
  playback: ConferenceApi;
  stream: MediaStream;
}

class LatencyService {
  @observable servers: Array<string> = ["https://rpc.codeda.com"];

  @observable workers: Array<number> = [0]

  @observable kinds: Array<"video"|"audio"> = ["video"]

  @observable updated = false;

  @observable socket: SocketIOClient.Socket = null;

  @observable publishedStreams: Array<IPublishedStream> = [];

  @observable subscribedStreams: Array<ISubscribedStream> = [];

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

  /**
   * TODO: make parallel publishing
   */
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

        const published: IPublishedStream = {
          streamId,
          url: server,
          capture,
          worker: this.workers[0],
        };

        this.listenStream(published);

        this.publishedStreams.push(published);
      });
    });
  }

  @action listenStream = async ({ streamId, url, worker: publishingWorker }: IPublishedStream) => {
    this.workers.forEach((subscribingWorker) => {
      this.socket.emit("auth", { stream: streamId, operation: API_OPERATION.SUBSCRIBE }, async (token: string) => {
        const playback = new ConferenceApi({
          kinds: this.kinds,
          url,
          worker: subscribingWorker,
          stream: streamId,
          token,
          origin: {
            url,
            worker: publishingWorker,
          },
        });

        const incommingStream = await playback.subscribe();

        const subscribed: ISubscribedStream = {
          url,
          streamId,
          playback,
          stream: incommingStream,
          worker: subscribingWorker,
        };

        this.subscribedStreams.push(subscribed);
      });
    });
  }

  @action clean = async () => {
    this.subscribedStreams.forEach((subscribedStream) => {
      subscribedStream.playback.close();
    });
    this.subscribedStreams = [];

    this.publishedStreams.forEach((publishedStream) => {
      publishedStream.capture.close();
    });

    this.publishedStreams = [];
    this.updated = false;
  }
}

export const latencyService = createContext(new LatencyService());

// Sample url to test two servers with two workers each
// http://localhost:4000/latency?server=https://node99.meshub.tv&worker=0&worker1=1
