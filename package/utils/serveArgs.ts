import type { ICameraStillOptions, ICameraVideoOptions } from "../interfaces";

export const _serveStill_params = (
  index: number,
  filename: string,
  width: number,
  height: number,
  options?: ICameraStillOptions
) => {
  const {
    contrast,
    brightness,
    quality,
    exposureCompensation,
    saturation,
    sharpness,
    autoFocusModeRange,
    effect,
    autoFocusOnCapture,
    awb,
    awbgains,
    burst,
    datetime,
    exposure,
    flipHorizontal,
    flipVertical,
    iso,
    rotation,
    zoom,
    timeout,
    noPreview,
    denoise,
    mode,
    metadata,
    finalCommand,
    initialCommand,
    timelapse,
    signal,
    keypress,
    format,
  } = options || {};

  const zoomValues: {
    name: ICameraStillOptions["zoom"];
    x: number;
    y: number;
    w: number;
    h: number;
  }[] = [
    { name: "1x", x: 0, y: 0, w: 1, h: 1 },
    { name: "2x", x: 0.25, y: 0.25, w: 0.5, h: 0.5 },
    { name: "3x", w: 0.33, h: 0.33, x: 0.385, y: 0.385 },
    { name: "4x", w: 0.25, h: 0.25, x: 0.375, y: 0.375 },
    { name: "5x", w: 0.2, h: 0.2, x: 0.4, y: 0.4 },
    { name: "6x", w: 0.16, h: 0.16, x: 0.42, y: 0.42 },
    { name: "7x", w: 0.14, h: 0.14, x: 0.43, y: 0.43 },
    { name: "8x", w: 0.125, h: 0.125, x: 0.437, y: 0.437 },
    { name: "9x", w: 0.11, h: 0.11, x: 0.445, y: 0.445 },
    { name: "10x", w: 0.1, h: 0.1, x: 0.45, y: 0.45 },
  ];
  const zoomValue = zoomValues.find((e) => e.name == (zoom || "1x"));

  const flags = [
    {
      key: "--roi",
      value: `${zoomValue!.x},${zoomValue!.y},${zoomValue!.w},${zoomValue!.h}`,
      cond: zoom,
    },
    { key: "--format", value: format, cond: format },
    { key: "--iso", value: iso, cond: iso },
    { key: "--effect", value: effect, cond: effect },
    { key: "--exposure", value: exposure, cond: exposure },
    {
      key: "--ev",
      value: exposureCompensation,
      cond: (exposureCompensation || -1) > -1,
    },
    { key: "--no-preview", cond: noPreview, value: undefined },
    { key: "--timeout", cond: (timeout || -1) > -1, value: timeout },
    { key: "--quality", cond: (quality || -1) > -1 },
    { key: "--contrast", cond: (contrast || -1) > -1, value: contrast },
    { key: "--sharpness", cond: (sharpness || -1) > -1, value: sharpness },
    { key: "--brightness", cond: (brightness || -1) > -1, value: brightness },
    { key: "--hflip", cond: flipHorizontal, value: undefined },
    { key: "--vflip", cond: flipVertical, value: undefined },
    {
      key: "--denoise",
      cond: typeof denoise == "boolean",
      value: denoise ? "on" : "off",
    },
    { key: "--saturation", cond: (saturation || -1) > -1, value: saturation },
    { key: "--awb", cond: awb, value: awb },
    {
      key: "--autofocus-on-capture",
      cond: autoFocusOnCapture,
      value: undefined,
    },
    { key: "--autofocus-range", cond: autoFocusModeRange, value: undefined },
    { key: "--mode", cond: mode, value: mode },
    { key: "--rotation", cond: (rotation || -1) > -1, value: rotation },
    { key: "--datatime", cond: datetime, value: undefined },
    { key: "--burst", cond: burst, value: undefined },
    { key: "--awbgains", cond: awbgains, value: awbgains },
    { key: "--metadata", cond: metadata, value: metadata ? "on" : "off" },
    { key: "--final", cond: finalCommand, value: finalCommand },
    { key: "--initial", cond: initialCommand, value: initialCommand },
    { key: "--timelapse", cond: (timelapse || -1) > -1, value: timelapse },
    { key: "--signal", cond: signal, value: signal },
    { key: "--keypress", cond: keypress, value: keypress },
    { key: "--output", cond: filename, value: filename },
    { key: "--width", cond: width, value: width },
    { key: "--height", cond: height, value: height },
    { key: "--camera", cond: index + 1, value: String(index) },
  ];

  const command = `rpicam-still ${flags
    .filter((e) => e.cond)
    .map((e) => `${e.key} ${e.value ? e.value : ""}`)
    .join(" ")}`;

  return command;
};

export const _serveVideo_params = (
  index: number,
  filename: string,
  timeout: number,
  width: number,
  height: number,
  options?: Omit<ICameraVideoOptions, "timeout">
) => {
  const {
    contrast,
    brightness,
    exposureCompensation,
    saturation,
    sharpness,
    autoFocusModeRange,
    effect,
    autoFocusOnCapture,
    awb,
    awbgains,
    datetime,
    exposure,
    flipHorizontal,
    flipVertical,
    iso,
    rotation,
    zoom,
    noPreview,
    denoise,
    mode,
    fps,
    instra,
    maxFileSize,
    segment,
    codec,
    codecLevel,
    codecProfile,
    bitrate,
    saveParts,
    circularMode,
    finalCommand,
    initialCommand,
    metadata,
    keypress,
    signal,
    format,
  } = options || {};

  const zoomValues: {
    name: ICameraStillOptions["zoom"];
    x: number;
    y: number;
    w: number;
    h: number;
  }[] = [
    { name: "1x", x: 0, y: 0, w: 1, h: 1 },
    { name: "2x", x: 0.25, y: 0.25, w: 0.5, h: 0.5 },
    { name: "3x", w: 0.33, h: 0.33, x: 0.385, y: 0.385 },
    { name: "4x", w: 0.25, h: 0.25, x: 0.375, y: 0.375 },
    { name: "5x", w: 0.2, h: 0.2, x: 0.4, y: 0.4 },
    { name: "6x", w: 0.16, h: 0.16, x: 0.42, y: 0.42 },
    { name: "7x", w: 0.14, h: 0.14, x: 0.43, y: 0.43 },
    { name: "8x", w: 0.125, h: 0.125, x: 0.437, y: 0.437 },
    { name: "9x", w: 0.11, h: 0.11, x: 0.445, y: 0.445 },
    { name: "10x", w: 0.1, h: 0.1, x: 0.45, y: 0.45 },
  ];
  const zoomValue = zoomValues.find((e) => e.name == (zoom || "1x"));

  const flags = [
    {
      key: "--roi",
      value: `${zoomValue!.x},${zoomValue!.y},${zoomValue!.w},${zoomValue!.h}`,
      cond: zoom,
    },
    { key: "--format", value: format, cond: format },
    { key: "--iso", value: iso, cond: iso },
    { key: "--effect", value: effect, cond: effect },
    { key: "--exposure", value: exposure, cond: exposure },
    {
      key: "--ev",
      value: exposureCompensation,
      cond: (exposureCompensation || -1) > -1,
    },
    { key: "--no-preview", cond: noPreview, value: undefined },
    { key: "--timeout", cond: (timeout || -1) > -1, value: timeout },
    { key: "--contrast", cond: (contrast || -1) > -1, value: contrast },
    { key: "--sharpness", cond: (sharpness || -1) > -1, value: sharpness },
    { key: "--brightness", cond: (brightness || -1) > -1, value: brightness },
    { key: "--hflip", cond: flipHorizontal, value: undefined },
    { key: "--vflip", cond: flipVertical, value: undefined },
    {
      key: "--denoise",
      cond: typeof denoise == "boolean",
      value: denoise ? "on" : "off",
    },
    { key: "--saturation", cond: (saturation || -1) > -1, value: saturation },
    { key: "--awb", cond: awb, value: awb },
    {
      key: "--autofocus-on-capture",
      cond: autoFocusOnCapture,
      value: undefined,
    },
    { key: "--autofocus-range", cond: autoFocusModeRange, value: undefined },
    { key: "--mode", cond: mode, value: mode },
    { key: "--rotation", cond: (rotation || -1) > -1, value: rotation },
    { key: "--datatime", cond: datetime, value: undefined },
    { key: "--awbgains", cond: awbgains, value: awbgains },
    { key: "--fps", cond: (fps || -1) > -1, value: fps },
    { key: "--instra", cond: (instra || -1) > -1, value: instra },
    { key: "--metadata", cond: metadata, value: metadata ? "on" : "off" },
    { key: "--final", cond: finalCommand, value: finalCommand },
    { key: "--initial", cond: initialCommand, value: initialCommand },
    { key: "--signal", cond: signal, value: signal },
    { key: "--keypress", cond: keypress, value: keypress },
    { key: "--codec", cond: codec, value: codec },
    { key: "--segment", cond: segment, value: segment },
    { key: "--level", cond: codecLevel, value: codecLevel },
    { key: "--profile", cond: codecProfile, value: codecProfile },
    { key: "--bitrate", cond: bitrate, value: bitrate },
    { key: "--save-pts", cond: saveParts, value: undefined },
    { key: "--max-length", cond: maxFileSize, value: maxFileSize },
    { key: "--circular", cond: circularMode, value: undefined },
    { key: "--output", cond: filename, value: filename },
    { key: "--width", cond: width, value: width },
    { key: "--height", cond: height, value: height },
    { key: "--camera", cond: index + 1, value: String(index) },
  ];

  const command = `rpicam-vid ${flags
    .filter((e) => e.cond)
    .map((e) => `${e.key} ${e.value ? e.value : ""}`)
    .join(" ")}`;

  return command;
};
