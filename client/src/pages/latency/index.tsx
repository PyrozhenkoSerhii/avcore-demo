import * as React from "react";
import { observer } from "mobx-react";
import { useLocation } from "react-router-dom";

import { latencyService } from "../../services/latency";

import { scanQRCodes } from "./utils";

import { LatencyComponent } from "./component/index";

const { useEffect, useContext } = React;

export const LatencyPage = observer((): JSX.Element => {
  const latencyStore = useContext(latencyService);
  const location = useLocation();

  useEffect(() => {
    latencyStore.updateServersFromLocation(location.search);
  }, [location]);

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

  return <LatencyComponent />;
});
