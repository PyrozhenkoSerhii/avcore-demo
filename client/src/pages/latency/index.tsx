import * as React from "react";
import * as QRCode from "qrcode.react";
import { observer } from "mobx-react";
import { useLocation } from "react-router-dom";

import { Canvas } from "../../interfaces/canvas";
import { latencyService } from "../../services/latency";
import { CanvasPlayerComponent } from "../../components/CanvasPlayer";

import { cssStyles, scanQRCodes } from "./utils";
import { LatencyWrapper } from "./styled";

const { useEffect, useState, useContext } = React;

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

  useEffect(() => {
    let interval = null;
    if (latencyStore.activePlayersCount === latencyStore.expectedSubscribePromises) {
      interval = setInterval(() => {
        scanQRCodes(latencyStore.subscribedStreams);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [latencyStore.activePlayersCount]);

  return (
    <>
      <LatencyWrapper id="pageToCapture">

        <QRCode
          id="qrcode"
          value={value}
          style={{
            width: cssStyles.width,
            height: cssStyles.height,
            marginRight: cssStyles.marginRight,
          }}
        />

        {latencyStore.subscribedStreams.map((subscribedStream) => (
          <CanvasPlayerComponent
            key={`${subscribedStream.server}${subscribedStream.worker}`}
            height={cssStyles.height}
            width={cssStyles.width}
            source={subscribedStream.stream}
            withBorder
            withCanvas
            subscribedStream={subscribedStream}
          />
        ))}
      </LatencyWrapper>
    </>
  );
});
