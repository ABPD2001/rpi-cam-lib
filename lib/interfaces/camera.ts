interface ICameraCommonOptions {
  timeout?: number;
  noPreview?: boolean;
  contrast?: number;
  sharpness?: number;
  brightness?: number;
  rotation?: 90 | 180 | 270 | 0;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  denoise?: boolean;
  effect?:
    | "none"
    | "negative"
    | "solarise"
    | "posterise"
    | "whiteboard"
    | "blackboard"
    | "sketch"
    | "denoise"
    | "emboss"
    | "oilpaint"
    | "hatch"
    | "gpen"
    | "pastel"
    | "watercolor"
    | "film"
    | "blur"
    | "saturation"
    | "colourswap"
    | "washedout"
    | "colourpoint"
    | "colourbalance"
    | "cartoon";
  zoom?: "1x" | "2x" | "3x" | "4x" | "5x" | "6x" | "7x" | "8x" | "9x" | "10x";
  exposureCompensation?: number;
  saturation?: number;
  autoFocusOnCapture?: boolean;
  autoFocusModeRange?: "normal" | "macro";
  initialCommand?: string;
  finalCommand?: string;
  mode?: string;
  awb?:
    | "auto"
    | "off"
    | "sun"
    | "cloud"
    | "shade"
    | "tungsten"
    | "fluorescent"
    | "incandescent"
    | "flash"
    | "incandescent";
  iso?: 100 | 200 | 400 | 800;
  signal?: string;
  keypress?: string;
  exposure?:
    | "night"
    | "auto"
    | "backlight"
    | "snow"
    | "sports"
    | "nightpreview"
    | "verylong"
    | "fixedfps"
    | "antishake"
    | "spotlight"
    | "beach";
  awbgains?: string;
  datetime?: boolean;
  metadata?: boolean;
}

export interface ICameraStillOptions extends ICameraCommonOptions {
  burst?: boolean;
  timelapse?: number;
  quality?: number;
}

export interface ICameraVideoOptions extends ICameraCommonOptions {
  fps?: number;
  bitrate?: string;
  codec?: "h264" | "mjpeg" | "yuv420" | "h265";
  audioChannels?: number;
  audioSamplerate?: number;
  audioBitrate?: string;
  audioCodec?: "aac" | "mp3" | "pcm";
  ffmpeg?: boolean;
  segment?: number;
  circularMode?: boolean;
  maxFileSize?: string;
  saveParts?: string;
  codecProfile?: "high" | "main";
  codecLevel?: string;
  instra?: number;
}

export interface ICameraOptions {
  autoReserve?: boolean;
}
