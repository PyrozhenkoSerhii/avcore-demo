/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Utils } from "avcore/client/dist";
import { Video } from "../styled";

const { useRef, useEffect } = React;

type TProps = {
  source: MediaStream;
  self?: boolean;
  playback?: any;
  width?: string;
  height?: string;
  disabledConrols?: boolean;
  withBorder?: boolean;
}

export const PlayerComponent = ({
  source, self, playback, width, height, disabledConrols, withBorder,
}: TProps): JSX.Element => {
  const player = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (player.current && source) {
      player.current.srcObject = source;

      if (!self && playback && Utils.isSafari) {
        const onStreamChange = () => {
          player.current.srcObject = new MediaStream(source.getTracks());
          player.current.play();
        };

        playback.on("addtrack", onStreamChange).on("removetrack", onStreamChange);
      }

      player.current.play();
    }
  }, [source, playback]);

  return (
    <Video
      ref={player}
      controls={!self && !!source && !disabledConrols}
      maxWidth={width}
      height={height}
      withBorder={withBorder}
      playsInline
      muted
    />
  );
};
