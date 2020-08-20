/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";

import { numericStyles, cssStyles } from "../../pages/latency/utils";
import { Video } from "../styled";
import { Canvas, PlayerWrapper } from "./styled";
import { ISubscribedStreamWithMedia } from "../../services/latency";

const { useRef, useEffect } = React;

type TProps = {
  source: MediaStream;
  width?: string;
  height?: string;
  withBorder?: boolean;
  withCanvas?: boolean;
  subscribedStream: ISubscribedStreamWithMedia;
}

export const CanvasPlayerComponent = ({
  source, width, height, withBorder, withCanvas,
}: TProps): JSX.Element => {
  const player = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (player.current && source) {
      player.current.srcObject = source;
      player.current.play();

      if (withCanvas) {
        const context = canvas.current.getContext("2d");

        player.current.addEventListener("play", () => {
          setInterval(() => {
            if (!player.current.paused && !player.current.ended) {
              context.drawImage(
                player.current,
                0, 0, player.current.videoHeight, player.current.videoWidth,
                0, 0, numericStyles.width, numericStyles.width,
              );
            }
          }, 16.66);
        });
      }
    }
  }, [source]);

  return (
    <PlayerWrapper
      width={cssStyles.width}
      height={cssStyles.width}
      marginRight={cssStyles.marginRight}
    >
      {withCanvas && (
        <Canvas width={numericStyles.width} height={numericStyles.width} ref={canvas} />
      )}
      <Video
        ref={player}
        controls={false}
        maxWidth={width}
        height={height}
        withBorder={withBorder}
        playsInline
        muted
        fullSize={!!withCanvas}
      />
    </PlayerWrapper>
  );
};
