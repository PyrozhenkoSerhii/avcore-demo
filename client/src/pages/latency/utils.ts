import { BrowserQRCodeReader, Result } from "@zxing/library";
import * as html2canvas from "html2canvas";

import { ISubscribedStreamWithMedia, IPublishedStream } from "../../services/latency";

export const numericStyles = { width: 50, height: 50, marginRight: 10 };

export const cssStyles = {
  width: `${numericStyles.width}px`,
  height: `${numericStyles.height}px`,
  marginRight: `${numericStyles.marginRight}px`,
};

interface ITimeMap {
  name: string;
  time: number;
}

const calculateDifference = (origin: ITimeMap, recieved: Array<ITimeMap>) => {
  recieved.forEach((item) => {
    console.log(`_LATENCY_ ${origin.time - item.time}ms from ${item.name} to ${origin.name}`);
  });
};

const scanCanvasChunk = async (canvas: HTMLCanvasElement, position: number): Promise<Result> => {
  const imageContent = canvas.getContext("2d").getImageData(
    position * (numericStyles.width + numericStyles.marginRight),
    0,
    numericStyles.width + 10,
    numericStyles.height + 10,
  );

  const newCanvas = document.createElement("canvas");

  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;

  newCanvas.getContext("2d").putImageData(imageContent, 0, 0);

  const imgURL = newCanvas.toDataURL("image/png");

  const image = new Image();
  image.src = imgURL;

  const reader = new BrowserQRCodeReader();

  try {
    return reader.decodeFromImage(image);
  } catch (err) {
    throw new Error(`Error occured while scanning QR code: ${JSON.stringify(err)}`);
  }
};

export const scanQRCodes = async (
  subscribedStreams: Array<ISubscribedStreamWithMedia>,
  publishedStream: IPublishedStream,
): Promise<void> => {
  const canvas = await html2canvas(document.querySelector("#pageToCapture"), { allowTaint: true, useCORS: true, logging: true });

  try {
    const originQrCode = await scanCanvasChunk(canvas, 0);
    const originTimeMap: ITimeMap = {
      name: `${publishedStream.server}[${publishedStream.worker}]`,
      time: Number(originQrCode.getText()),
    };

    /**
   * Since the first element on canvas is an origin stream
   * all the subscribed streams starts from second element
   */
    const recievedQrCodesPromise = subscribedStreams.map(
      (stream, index) => scanCanvasChunk(canvas, index + 1),
    );

    const recievedQrCodes = await Promise.all(recievedQrCodesPromise);

    const recievedTimeMaps = recievedQrCodes.map<ITimeMap>((result, index) => ({
      name: `${subscribedStreams[index].server}[${subscribedStreams[index].worker}]`,
      time: Number(result.getText()),
    }));

    calculateDifference(originTimeMap, recievedTimeMaps);
  } catch (err) {
    console.log("Error while resolving scan promises: ", err);
  }
};
