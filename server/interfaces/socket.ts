import {API_OPERATION} from "avcore";

export interface IExtSocket extends SocketIO.Socket {
  streamId: string;
  serverUrl: string;
  mixerId: string;
}

export type TOnSaveMixerProps = {
  mixerId: string;
  streamId: string;
  serverUrl: string;
}

export type TOnAuthProps = {
  stream: string;
  operation: API_OPERATION;
}

export type TOnAuthCallback = {
  (token: string): void;
}