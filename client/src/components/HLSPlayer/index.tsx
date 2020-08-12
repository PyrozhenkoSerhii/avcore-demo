import * as React from "react";
import * as Hls from "hls.js";

import { Video } from "../styled";

const { useRef, useEffect } = React;

type TProps = {
  url: string;
}

export const HLSPlayerComponent = ({ url }: TProps): JSX.Element => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (url && videoRef.current) {
      console.log("hls url: ", url);
      const hls = new Hls();
      hls.loadSource(url);
      // hls.loadSource("https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8");
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play();
      });
    }
  }, [url]);

  return (
    <Video ref={videoRef} />
  );
};
