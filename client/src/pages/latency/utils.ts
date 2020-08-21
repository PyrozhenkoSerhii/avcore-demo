import {
  BrowserQRCodeReader, Result, QRCodeReader, BinaryBitmap,
  BarcodeFormat, DecodeHintType, RGBLuminanceSource, HybridBinarizer,
} from "@zxing/library";
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

const scanQRCodeFromImageZXing = async (img: HTMLImageElement): Promise<string> => {
  const reader = new BrowserQRCodeReader();

  console.log("Scanning begins...");
  try {
    const read = await reader.decodeFromImage(img);
    console.log("Scanning ends with value", read.getText());
    return read.getText();
  } catch (err) {
    console.log("Error while scanning: ", err);
    return "";
  }
};

const scanQRCodeFromBinaryZXing = async (buffer: Uint8ClampedArray): Promise<Result> => {
  const hints = new Map();
  const formats = [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX];

  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
  hints.set(DecodeHintType.TRY_HARDER, true);
  hints.set(DecodeHintType.PURE_BARCODE, true);

  const luminanceSource = new RGBLuminanceSource(
    buffer, numericStyles.width + 10, numericStyles.height,
  );

  const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

  const reader = new QRCodeReader();
  return reader.decode(binaryBitmap);
};

const scanCanvasChunk = (canvas: HTMLCanvasElement, position: number): Promise<string> => {
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

  return scanQRCodeFromImageZXing(image);

  // scanQRCodeFromBinaryZXing(imageContent.data);

  // return scanQRCodeFromImage(img);
};

export const scanQRCodes = async (
  subscribedStreams: Array<ISubscribedStreamWithMedia>,
): Promise<void> => {
  const canvas = await html2canvas(document.querySelector("#pageToCapture"), { allowTaint: true, useCORS: true, logging: true });

  try {
    console.log("attempt to scan qr code for origin");
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
      (stream, index) => {
        console.log(`Attempt to scan code for ${stream.server}[${stream.worker}]`);
        return scanCanvasChunk(canvas, index + 1);
      },
    );

    try {
      console.log("resolving scan promises for recieved qr codes");
      const recievedQrCodes = await Promise.all(recievedQrCodesPromise);

      const recievedTimeMaps = recievedQrCodes.map<ITimeMap>((result, index) => ({
        name: `${subscribedStreams[index].server}[${subscribedStreams[index].worker}]`,
        time: Number(result),
      }));

      calculateDifference(originTimeMap, recievedTimeMaps);
    } catch (err) {
      console.log("Error while resolving scan promises for recieved qr codes", err);
    }
  } catch (err) {
    console.log("Error while resolving scan promises for origin qr codes", err);
  }
};
