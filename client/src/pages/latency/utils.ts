/* eslint-disable no-param-reassign */
import { BrowserQRCodeReader, Result } from "@zxing/library";
import * as html2canvas from "html2canvas";

export const numericStyles = {
  width: 256, height: 256, marginRight: 20, marginTop: 20,
};

export const cssStyles = {
  width: `${numericStyles.width}px`,
  height: `${numericStyles.height}px`,
  marginRight: `${numericStyles.marginRight}px`,
  marginTop: `${numericStyles.marginTop}px`,
};

export const scanSingleQrCode = (
  canvas: HTMLCanvasElement,
  position: number,
  newCanvas: HTMLCanvasElement,
): Promise<Result> => {
  // const imageContent = canvas.getContext("2d").getImageData(
  //   position * (numericStyles.width + numericStyles.marginRight),
  //   numericStyles.marginTop,
  //   numericStyles.width,
  //   numericStyles.height,
  // );

  const imageContent = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);

  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;

  newCanvas.getContext("2d").putImageData(imageContent, 0, 0);

  const reader = new BrowserQRCodeReader();
  const img = newCanvas.toDataURL("image/png");

  return reader.decodeFromImageUrl(img);
};

export const scanQRCodes = async (newCanvas: HTMLCanvasElement): Promise<void> => {
  const canvas = await html2canvas(document.querySelector("#pageToCapture"), { allowTaint: true, useCORS: true, logging: true });
  const originQrCode = await scanSingleQrCode(canvas, 0, newCanvas);

  /**
   * Since the first element on canvas is an origin stream
   * all the subscribed streams starts from second element
   */
  // const subscribedQrCodesPromise = latencyStore.subscribedStreams.map(
  //   (stream, index) => scanSingleQrCode(canvas, index + 1),
  // );

  // const subscribedQrCodes = await Promise.all(subscribedQrCodesPromise);

  console.log(`Origin qrcode time: ${originQrCode.getText()}`);
  // console.log(subscribedQrCodes);
};
