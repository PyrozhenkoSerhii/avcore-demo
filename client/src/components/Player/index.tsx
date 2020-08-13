import * as React from "react";
import { Utils } from "avcore/client/dist";
import { Video } from "../styled";

const { useRef, useEffect } = React;

type TProps = {
  source: MediaStream;
  self?: boolean;
  playback: any;
}

export const PlayerComponent = ({ source, self, playback }: TProps): JSX.Element => {
  const player = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (player.current && source) {
      player.current.srcObject = source;
      if (Utils.isSafari) {
        const onStreamChange = () => {
          player.current.srcObject = new MediaStream(source.getTracks());
          player.current.play();
        };

        playback.on("addtrack", onStreamChange).on("removetrack", onStreamChange);
      }
      player.current.play();
    }
  }, [source]);

  return (
    <Video ref={player} muted controls={!self && !!source} />
  );
};
