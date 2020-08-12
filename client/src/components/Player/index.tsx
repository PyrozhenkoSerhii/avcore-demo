import * as React from "react";

import { Video } from "../styled";

const { useRef, useEffect } = React;

type TProps = {
  source: MediaStream;
}

export const PlayerComponent = ({ source }: TProps): JSX.Element => {
  const player = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (player.current && source) {
      player.current.srcObject = source;
      player.current.play();
    }
  }, [source]);

  return (
    <Video ref={player} />
  );
};
