import { ConferenceApi } from "avcore/client/dist";
import { createContext } from "react";
import { observable, action, autorun } from "mobx";
import { forEach } from "lodash";
import * as queryString from "query-string";
import * as io from "socket.io-client";
import * as shortId from "shortid";
import { API_OPERATION } from "avcore";

export interface IPublishedStream {
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
}

export interface ISubscribedStreamWithMedia extends ISubscribedStream {
  stream: MediaStream;
}

interface ISubscribedStreamWithPromise extends ISubscribedStream {
  streamPromise: Promise<MediaStream>;
}

// Sample url to test two servers with two workers each
// http://app.avcore.io/latency?server=https://node99.meshub.tv&worker=0&worker1=1
class LatencyService {
  @observable servers: Array<string> = ["https://rpc.codeda.com"];

  @observable workers: Array<number> = [0]

  @observable kinds: Array<"video"|"audio"> = ["video"]

  @observable expectedSubscribePromises = 1;

  @observable updated = false;

  @observable socket: SocketIOClient.Socket = null;

  @observable publishedStream: IPublishedStream = null;

  @observable subscribedStreams: Array<ISubscribedStreamWithMedia> = [];

  @observable subscribedStreamsWithPromises: Array<ISubscribedStreamWithPromise> = [];

  @observable activePlayersCount = 0;

  constructor() {
    this.socket = io(`${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}`);
    autorun(
      () => {
        if (this.subscribedStreamsWithPromises.length === this.expectedSubscribePromises) {
          const promises = this.subscribedStreamsWithPromises.map((item) => item.streamPromise);
          this.resolvePromises(this.subscribedStreamsWithPromises, promises);
        }
      },
    );
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

    this.expectedSubscribePromises = this.servers.length * this.workers.length;
    this.updated = true;
  }

  @action publishCanvas = (mediaStream: MediaStream) => {
    const streamId = shortId.generate();
    const publishingServer = this.servers[0];
    const publishingWorker = this.workers[0];

    this.socket.emit("auth", { stream: streamId, operation: API_OPERATION.PUBLISH }, async (token: string) => {
      try {
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
      } catch (err) {
        console.log("Error occured while publishing stream: ", err);
      }
    });
  }

  @action listenStream = ({
    streamId,
    server: originServer,
    worker: originWorker,
  }: IPublishedStream) => {
    this.servers.forEach((subscribingServer) => {
      this.workers.forEach((subscribingWorker) => {
        this.socket.emit("auth", { stream: streamId, operation: API_OPERATION.SUBSCRIBE }, (token: string) => {
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

  @action clean = () => {
    this.subscribedStreams.forEach((subscribedStream) => {
      subscribedStream.playback.close();
    });
    this.subscribedStreams = [];
    this.subscribedStreamsWithPromises = [];

    if (this.publishedStream) {
      this.publishedStream.capture.close();
      this.publishedStream = null;
    }

    this.expectedSubscribePromises = 1;
    this.activePlayersCount = 0;
    this.updated = false;
  }

  @action resolvePromises = async (
    data: Array<ISubscribedStreamWithPromise>,
    promises: Array<Promise<MediaStream>>,
  ) => {
    try {
      const streams = await Promise.all(promises);

      const subscribedStreams = streams.map<ISubscribedStreamWithMedia>((stream, index) => ({
        server: data[index].server,
        streamId: data[index].streamId,
        playback: data[index].playback,
        stream,
        worker: data[index].worker,
      }));

      this.subscribedStreams = subscribedStreams;
    } catch (err) {
      console.log("Error occured while resolving promises from subscribed streams: ", err);
    }
  }

  @action setPlayerActive = () => {
    this.activePlayersCount += 1;
  }
}

export const latencyService = createContext(new LatencyService());
