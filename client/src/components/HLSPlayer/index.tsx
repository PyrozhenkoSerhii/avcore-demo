import * as React from "react";
import * as Hls from "hls.js";
import { CircularProgress } from "@material-ui/core";

import { Video } from "../styled";
import { Loader, WithLoaderWrapper } from "./styled";

const { ErrorTypes } = Hls;
const { useRef, useEffect, useMemo } = React;

type TProps = {
  url: string;
  available: boolean;
}

export const HLSPlayerComponent = ({ url, available }: TProps): JSX.Element => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const hls = useMemo(() => new Hls({ capLevelToPlayerSize: true }), []);

  useEffect(() => {
    if (hls && url && videoRef.current && available) {
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.type === ErrorTypes.NETWORK_ERROR) {
          setTimeout(() => {
            hls.loadSource(url);
            hls.startLoad();
          }, 1000);
        }
      });
    }
  }, [hls, url, available]);

  return (
    <WithLoaderWrapper>
      {!available && url && (
        <Loader>
          <CircularProgress />
        </Loader>
      )}
      <Video ref={videoRef} muted controls />
    </WithLoaderWrapper>
  );
};
