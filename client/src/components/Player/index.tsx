import * as React from "react";

import { Video } from "../styled";

const { useRef, useEffect } = React;

type TProps = {
  source: MediaStream;
  self?: boolean;
}

export const PlayerComponent = ({ source, self }: TProps): JSX.Element => {
  const player = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (player.current && source) {
      player.current.srcObject = source;
      player.current.play();
    }
  }, [source]);

  return (
    <Video ref={player} muted controls={!self && !!source} />
  );
};
