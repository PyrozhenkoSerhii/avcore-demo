import * as React from "react";
import * as QRCode from "qrcode.react";
import { observer } from "mobx-react";
import { useLocation } from "react-router-dom";

import { Canvas } from "../../interfaces/canvas";
import { latencyService } from "../../services/latency";
import { PlayerComponent } from "../../components/Player";

import { LatencyWrapper } from "./styled";

const { useEffect, useState, useContext } = React;

const styles = { width: "200px", height: "200px" };

/**
 * TODO: same params in router via mobx store
 */
export const LatencyPage = observer((): JSX.Element => {
  const latencyStore = useContext(latencyService);
  const location = useLocation();

  useEffect(() => {
    latencyStore.updateServersFromLocation(location.search);
  }, [location]);

  const [value, setValue] = useState(Date.now().toString());

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(Date.now().toString());
    }, 16.66);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = document.getElementById("qrcode") as Canvas;
    const canvasStream = canvas.captureStream();

    latencyStore.publishCanvas(canvasStream);

    return () => latencyStore.clean();
  }, []);

  return (
    <LatencyWrapper>
      <QRCode id="qrcode" style={styles} value={value} />

      {latencyStore.subscribedStreams.map((subscribedStream) => (
        <PlayerComponent
          key={`${subscribedStream.server}${subscribedStream.worker}`}
          height={styles.height}
          width={styles.width}
          source={subscribedStream.stream}
          disabledConrols
        />
      ))}
    </LatencyWrapper>
  );
});
