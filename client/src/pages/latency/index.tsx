import * as React from "react";
import * as QRCode from "qrcode.react";
import { observer } from "mobx-react";
import { useLocation } from "react-router-dom";

import { Canvas } from "../../interfaces/canvas";
import { latencyService } from "../../services/latency";
import { PlayerComponent } from "../../components/Player";

import { cssStyles, scanQRCodes } from "./utils";
import { LatencyWrapper } from "./styled";

const {
  useEffect, useState, useContext, useRef,
} = React;

/**
 * TODO: same params in router via mobx store
 */
export const LatencyPage = observer((): JSX.Element => {
  const latencyStore = useContext(latencyService);
  const location = useLocation();
  const canvasTest = useRef<HTMLCanvasElement>(null);

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

  useEffect(() => {
    if (latencyStore.subscribedStreams.length === latencyStore.expectedSubscribePromises) {
      setTimeout(() => {
        scanQRCodes(canvasTest.current);
      }, 1000);
    }
  }, [latencyStore.subscribedStreams]);

  return (
    <>
      <LatencyWrapper
        id="pageToCapture"
        marginRight={cssStyles.marginRight}
        marginTop={cssStyles.marginTop}
      >

        <QRCode
          id="qrcode"
          value={value}
          style={{ width: cssStyles.width, height: cssStyles.height }}
        />

        {latencyStore.subscribedStreams.map((subscribedStream) => (
          <PlayerComponent
            key={`${subscribedStream.server}${subscribedStream.worker}`}
            height={cssStyles.height}
            width={cssStyles.width}
            source={subscribedStream.stream}
            disabledConrols
            withBorder
          />
        ))}
      </LatencyWrapper>
      <canvas ref={canvasTest} />
    </>
  );
});
