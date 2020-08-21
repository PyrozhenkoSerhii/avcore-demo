/* eslint-disable no-param-reassign */
import { BrowserQRCodeReader, Result } from "@zxing/library";
import * as html2canvas from "html2canvas";
import { Decoder } from "@nuintun/qrcode";
import { ISubscribedStreamWithMedia } from "../../services/latency";

export const numericStyles = { width: 256, height: 256, marginRight: 20 };

export const cssStyles = {
  width: `${numericStyles.width}px`,
  height: `${numericStyles.height}px`,
  marginRight: `${numericStyles.marginRight}px`,
};

interface ITimeMap {
  name: string;
  time: number;
}

interface ITimeDiff {
  name: string;
  difference: string;
}

const calculateDifference = (origin: ITimeMap, recieved: Array<ITimeMap>) => {
  const diff = recieved.map<ITimeDiff>((item) => ({
    name: item.name,
    difference: `+${origin.time - item.time}ms`,
  }));

  console.table([{
    name: origin.name,
    difference: "+0ms",
  }, ...diff]);
};

const scanSingleQrCode = async (canvas: HTMLCanvasElement, position: number): Promise<string> => {
  const imageContent = canvas.getContext("2d").getImageData(
    position * (numericStyles.width + numericStyles.marginRight),
    0,
    numericStyles.width + 10,
    numericStyles.height,
  );

  const newCanvas = document.createElement("canvas");

  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;

  newCanvas.getContext("2d").putImageData(imageContent, 0, 0);

  const img = newCanvas.toDataURL("image/png");

  // const reader = new BrowserQRCodeReader();

  // let read = null;
  // try {
  //   read = reader.decodeFromImageUrl(img);
  // } catch (err) {
  //   console.log("Reader decodeFromImageUrl error: ", err);
  // }

  const decoder = new Decoder();
  decoder.setOptions({ inversionAttempts: "attemptBoth" });
  const result = await decoder.scan(img);
  return result.data;

  // document.body.appendChild(newCanvas);
  // newCanvas.style.border = "1px solid red";
  // return read;
};

export const scanQRCodes = async (
  subscribedStreams: Array<ISubscribedStreamWithMedia>,
): Promise<void> => {
  try {
    const canvas = await html2canvas(document.querySelector("#pageToCapture"), { allowTaint: true, useCORS: true, logging: true });
    const originQrCode = await scanSingleQrCode(canvas, 0);
    const originTimeMap: ITimeMap = {
      name: "origin",
      time: Number(originQrCode),
    };

    /**
   * Since the first element on canvas is an origin stream
   * all the subscribed streams starts from second element
   */
    const recievedQrCodesPromise = subscribedStreams.map(
      (stream, index) => scanSingleQrCode(canvas, index + 1),
    );

    const recievedQrCodes = await Promise.all(recievedQrCodesPromise);

    const recievedTimeMaps = recievedQrCodes.map<ITimeMap>((result, index) => ({
      name: `${subscribedStreams[index].server}[${subscribedStreams[index].worker}]`,
      time: Number(result),
    }));

    calculateDifference(originTimeMap, recievedTimeMaps);
  } catch (err) {
    console.log("ScanQRCodes error: ", err);
  }
};
