import * as React from "react";
import * as QRCode from "qrcode.react";

import { Canvas } from "../../interfaces/canvas";

const { useEffect, useState, useRef } = React;
const styles = { width: "200px", height: "200px" };

export const LatencyPage = (): JSX.Element => {
  const player = useRef<HTMLVideoElement>(null);

  const [value, setValue] = useState(Date.now().toString());

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(Date.now().toString());
    }, 16.66);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (player.current) {
      const canvas = document.getElementById("qrcode") as Canvas;
      const canvasStream = canvas.captureStream();

      player.current.srcObject = canvasStream;
    }
  }, []);

  return (
    <>
      <QRCode id="qrcode" style={styles} value={value} />
      <video muted style={styles} autoPlay ref={player} />
    </>
  );
};
