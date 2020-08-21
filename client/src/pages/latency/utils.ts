/* eslint-disable no-param-reassign */
import { BrowserQRCodeReader, Result } from "@zxing/library";
import {
  MultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  RGBLuminanceSource,
  BinaryBitmap,
  HybridBinarizer,
} from "@zxing/library/esm5";
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

const scanQRCodeFromImage = async (img: string): Promise<string> => {
  const decoder = new Decoder();
  decoder.setOptions({ inversionAttempts: "attemptBoth" });
  const result = await decoder.scan(img);
  return result.data;
};

const scanQRCodeFromImageZXing = async (img: string): Promise<Result> => {
  const reader = new BrowserQRCodeReader();

  let read = null;
  try {
    read = reader.decodeFromImageUrl(img);
  } catch (err) {
    console.error("Reader decodeFromImageUrl error: ", err);
  }
  console.log(read);
  return read;
};

const scanQRCodeFromBinaryZXing = async (buffer: ArrayBuffer): Promise<Result> => {
  const hints = new Map();
  const formats = [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX];

  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);

  const reader = new MultiFormatReader();

  reader.setHints(hints);

  const luminanceSource = new RGBLuminanceSource(
    new Uint8ClampedArray(buffer),
    numericStyles.width + 10, numericStyles.height,
  );

  const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

  let result = null;
  try {
    result = await reader.decode(binaryBitmap);
  } catch (e) {
    console.error(e);
  }
  return result;
};

const scanCanvasChunk = async (canvas: HTMLCanvasElement, position: number): Promise<string> => {
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

  scanQRCodeFromImageZXing(img);

  const { buffer } = imageContent.data;
  scanQRCodeFromBinaryZXing(buffer);

  return scanQRCodeFromImage(img);
};

export const scanQRCodes = async (
  subscribedStreams: Array<ISubscribedStreamWithMedia>,
): Promise<void> => {
  try {
    const canvas = await html2canvas(document.querySelector("#pageToCapture"), { allowTaint: true, useCORS: true, logging: true });
    const originQrCode = await scanCanvasChunk(canvas, 0);
    const originTimeMap: ITimeMap = {
      name: "origin",
      time: Number(originQrCode),
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
      time: Number(result),
    }));

    calculateDifference(originTimeMap, recievedTimeMaps);
  } catch (err) {
    console.log("ScanQRCodes error: ", err);
  }
};
