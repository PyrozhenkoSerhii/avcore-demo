import * as React from "react";
import videojs from "video.js";
import { CircularProgress } from "@material-ui/core";

import { Video } from "../styled";
import { Loader, WithLoaderWrapper } from "../HLSPlayer/styled";

const { useRef, useEffect } = React;

type TProps = {
  url: string;
  available: boolean;
}

export const HLSPlayerVideoJSComponent = ({ url, available }: TProps): JSX.Element => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && url && available) {
      const player = videojs(videoRef.current, {
        autoplay: true,
        controls: true,
        sources: [{
          src: url,
          type: "application/x-mpegURL",
        }],
      });

      player.play();
    }
  }, [url, available]);

  return (
    <WithLoaderWrapper>
      {url && !available && (
        <Loader>
          <CircularProgress />
        </Loader>
      )}
      <Video ref={videoRef} className="video-js" muted />
    </WithLoaderWrapper>

  );
};
