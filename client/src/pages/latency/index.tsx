import * as React from "react";
import * as QRCode from "qrcode.react";
import { observer } from "mobx-react";
import { useLocation } from "react-router-dom";

import { Canvas } from "../../interfaces/canvas";
import { latencyService } from "../../services/latency";
import { PlayerComponent } from "../../components/Player";

const {
  useEffect, useState, useRef, useContext,
} = React;

const styles = { width: "200px", height: "200px" };

export const LatencyPage = observer((): JSX.Element => {
  const latencyStore = useContext(latencyService);
  const location = useLocation();

  useEffect(() => {
    latencyStore.updateServersFromLocation(location.search);
  }, [location]);

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

      latencyStore.publishCanvas(canvasStream);

      player.current.srcObject = canvasStream;
    }
  }, []);

  return (
    <>
      <QRCode id="qrcode" style={styles} value={value} />
      <video muted style={styles} autoPlay ref={player} />
      <PlayerComponent source={latencyStore.incommingStream} />
    </>
  );
});
