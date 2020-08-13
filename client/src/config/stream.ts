import { MixerOptions, MIXER_RENDER_TYPE, MixerHlsFormatOptions } from "avcore";

export const conferenceConfig = {
  kinds: ["audio", "video"],
  url: "https://rpc.codeda.com",
  worker: 0,
};

export const mixerPipeFormats: MixerHlsFormatOptions[] = [
  { videoBitrate: 4000 },
  { videoBitrate: 1000, height: 480 },
];

export const mixerOptions: MixerOptions = {
  x: 0,
  y: 0,
  width: 640,
  height: 480,
  z: 0,
  renderType: MIXER_RENDER_TYPE.CROP,
};
