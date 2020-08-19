interface Capturable {
  captureStream(): MediaStream;
}

export interface Canvas extends HTMLCanvasElement, Capturable {}
