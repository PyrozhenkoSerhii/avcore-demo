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
        html5: {
          nativeAudioTracks: false,
          nativeVideoTracks: false,
          hls: {
            overrideNative: true,
          },
        },
        autoplay: true,
        controls: true,
        sources: [{
          src: url,
          type: "application/x-mpegURL",
        }],
      });

      videoRef.current.addEventListener("canplay", () => {
        player.play();
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
      <Video ref={videoRef} className="video-js" muted fullSize playsInline />
    </WithLoaderWrapper>

  );
};
