import {API_OPERATION} from "avcore";

export interface ISocketAuth {
  data: {
    token: string;
    operation: API_OPERATION;
  };
  (token: string): void;
}