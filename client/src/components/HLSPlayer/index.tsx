import * as React from "react";
import * as Hls from "hls.js";
import { CircularProgress } from "@material-ui/core";

import { Video } from "../styled";
import { Loader, WithLoaderWrapper } from "./styled";

const { ErrorTypes } = Hls;
const {
  useRef, useEffect, useMemo, useState,
} = React;

type TProps = {
  url: string;
}

export const HLSPlayerComponent = ({ url }: TProps): JSX.Element => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [loading, setLoading] = useState(true);

  const hls = useMemo(() => new Hls(), []);

  useEffect(() => {
    if (hls && url && videoRef.current) {
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
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
  }, [hls, url]);

  return (
    <WithLoaderWrapper>
      {loading && url && (
        <Loader>
          <CircularProgress />
        </Loader>
      )}
      <Video ref={videoRef} />
    </WithLoaderWrapper>
  );
};
