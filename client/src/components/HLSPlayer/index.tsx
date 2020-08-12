import * as React from "react";
import * as Hls from "hls.js";

import { Video } from "../styled";

const { ErrorTypes } = Hls;
const {
  useRef, useEffect, useMemo,
} = React;

type TProps = {
  url: string;
}

export const HLSPlayerComponent = ({ url }: TProps): JSX.Element => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const hls = useMemo(() => new Hls(), []);

  useEffect(() => {
    if (hls && url && videoRef.current) {
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
  }, [hls, url]);

  return (
    <Video ref={videoRef} />
  );
};
