import * as React from "react";
import videojs from "video.js";
import { CircularProgress } from "@material-ui/core";

import { Video } from "../styled";
import { Loader, WithLoaderWrapper } from "../HLSPlayer/styled";

const { useRef, useEffect, useState } = React;

type TProps = {
  url: string;
  available: boolean;
}

export const HLSPlayerVideoJSComponent = ({ url, available }: TProps): JSX.Element => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [player, setPlayer] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (videoRef.current && available) {
      const instance = videojs(videoRef.current, {
        html5: {
          nativeAudioTracks: false,
          nativeVideoTracks: false,
          hls: {
            overrideNative: true,
          },
        },
        autoplay: true,
        controls: true,

      });

      videoRef.current.addEventListener("canplay", () => {
        instance.play();
      });

      instance.play();

      setPlayer(instance);
    }
  }, [available]);

  useEffect(() => {
    if (player && available) {
      player.muted(true);
      player.controls(true);
      player.src({
        src: url,
        type: "application/x-mpegURL",
      });
      setPlaying(true);
    }
  }, [player, available]);

  useEffect(() => {
    if (player && playing && !available) {
      player.controls(false);
      player.reset();
      setPlaying(false);
    }
  }, [player, playing, available]);

  /**
   * Extra div was added to fix a strange issue of compatibility of
   * styled-components and video.js on stop/start
   * https://github.com/facebook/react/issues/13278
   */
  return (
    <WithLoaderWrapper>
      {url && !available && (
      <Loader>
        <CircularProgress />
      </Loader>
      )}
      <div>
        <Video fullSize ref={videoRef} className="video-js" muted playsInline />
      </div>
    </WithLoaderWrapper>
  );
};
