import { ConferenceApi } from "avcore/client/dist";
import { createContext } from "react";
import { observable, action, when } from "mobx";
import { forEach } from "lodash";
import * as queryString from "query-string";
import * as io from "socket.io-client";
import * as shortId from "shortid";
import { API_OPERATION } from "avcore";

interface IPublishedStream {
  server: string;
  streamId: string;
  capture: ConferenceApi;
  worker: number;
}

interface ISubscribedStream {
  server: string;
  worker: number;
  streamId: string;
  playback: ConferenceApi;
  stream: MediaStream;
}

interface ISubscribedStreamWithPromise {
  server: string;
  worker: number;
  streamId: string;
  playback: ConferenceApi;
  streamPromise: Promise<MediaStream>;
}

class LatencyService {
  @observable servers: Array<string> = ["https://rpc.codeda.com"];

  @observable workers: Array<number> = [0]

  @observable kinds: Array<"video"|"audio"> = ["video"]

  @observable updated = false;

  @observable socket: SocketIOClient.Socket = null;

  @observable publishedStream: IPublishedStream = null;

  @observable subscribedStreams: Array<ISubscribedStream> = [];

  @observable subscribedStreamsWithPromises: Array<ISubscribedStreamWithPromise> = [];

  @observable awaitedConnections = 1;

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

    this.awaitedConnections = this.servers.length * this.workers.length;
    this.updated = true;
  }

  @action publishCanvas = async (mediaStream: MediaStream) => {
    const streamId = shortId.generate();
    const publishingServer = this.servers[0];
    const publishingWorker = this.workers[0];

    this.socket.emit("auth", { stream: streamId, operation: API_OPERATION.PUBLISH }, async (token: string) => {
      const capture = new ConferenceApi({
        kinds: this.kinds,
        url: publishingServer,
        worker: publishingWorker,
        stream: streamId,
        token,
      });

      await capture.publish(mediaStream);

      const published: IPublishedStream = {
        streamId,
        server: publishingServer,
        capture,
        worker: publishingWorker,
      };

      this.listenStream(published);

      this.publishedStream = published;
    });
  }

  @action listenStream = async ({
    streamId,
    server: originServer,
    worker: originWorker,
  }: IPublishedStream) => {
    this.servers.forEach((subscribingServer) => {
      this.workers.forEach((subscribingWorker) => {
        this.socket.emit("auth", { stream: streamId, operation: API_OPERATION.SUBSCRIBE }, async (token: string) => {
          const playback = new ConferenceApi({
            kinds: this.kinds,
            url: subscribingServer,
            worker: subscribingWorker,
            stream: streamId,
            token,
            origin: {
              url: originServer,
              worker: originWorker,
            },
          });

          const playbackPromise = playback.subscribe();

          const subscribed: ISubscribedStreamWithPromise = {
            server: subscribingServer,
            streamId,
            playback,
            streamPromise: playbackPromise,
            worker: subscribingWorker,
          };

          this.subscribedStreamsWithPromises.push(subscribed);
        });
      });
    });
  }

  @action clean = async () => {
    this.subscribedStreams.forEach((subscribedStream) => {
      subscribedStream.playback.close();
    });
    this.subscribedStreams = [];

    this.publishedStream.capture.close();
    this.publishedStream = null;

    this.updated = false;
  }

  disposer = when(
    () => this.subscribedStreamsWithPromises.length === this.awaitedConnections,
    async () => {
      const promises = this.subscribedStreamsWithPromises.map((item) => item.streamPromise);
      this.resolvePromises(this.subscribedStreamsWithPromises, promises);
    },
  )

  @action resolvePromises = async (
    data: Array<ISubscribedStreamWithPromise>,
    promises: Array<Promise<MediaStream>>,
  ) => {
    const streams = await Promise.all(promises);

    const subscribedStreams = streams.map<ISubscribedStream>((stream, index) => ({
      server: data[index].server,
      streamId: data[index].streamId,
      playback: data[index].playback,
      stream,
      worker: data[index].worker,
    }));

    this.subscribedStreams = subscribedStreams;
  }
}

export const latencyService = createContext(new LatencyService());

// Sample url to test two servers with two workers each
// http://localhost:4000/latency?server=https://node99.meshub.tv&worker=0&worker1=1
