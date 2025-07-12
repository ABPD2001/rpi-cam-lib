import { spawn, exec, execSync } from "node:child_process";
import { kill } from "node:process";
import {
  ICameraOptions,
  ICameraStillOptions,
  ICameraVideoOptions,
} from "./interfaces/camera";
import { EventEmitter } from "node:events";

class LiveMode extends EventEmitter {
  constructor() {
    super();
  }
}

export class RPICam {
  private camera: number;
  private options?: ICameraOptions;
  private reserved: boolean = false;
  public tasks: { id: string; pid: number }[];
  public live: LiveMode = new LiveMode();

  constructor(camera: number, options?: ICameraOptions) {
    this.camera = camera;
    this.tasks = [];
    this.options = options;
    if (options?.autoReserve && this.isReadySync()) {
      this.reserve();
    }
  }

  private _serveStill_params(
    filename: string,
    format: string | "auto" = "auto",
    width: number,
    height: number,
    options?: ICameraStillOptions
  ) {
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
        value: `${zoomValue!.x},${zoomValue!.y},${zoomValue!.w},${
          zoomValue!.h
        }`,
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
      { key: "-n", cond: noPreview, value: undefined },
      { key: "-t", cond: (timeout || -1) > -1, value: timeout },
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
    ];

    const command = `rpicam-still --camera ${this.camera} ${flags
      .filter((e) => e.cond)
      .map((e) => `${e.key}${e.value ? e.value : ""}`)
      .join(" ")} -w ${width} -h ${height} -o ${filename}`;

    return command;
  }

  private _serveVideo_params(
    filename: string,
    timeout: number,
    format: string | "auto" = "auto",
    width: number,
    height: number,
    options?: Omit<ICameraVideoOptions, "timeout">
  ) {
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
        value: `${zoomValue!.x},${zoomValue!.y},${zoomValue!.w},${
          zoomValue!.h
        }`,
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
      { key: "-n", cond: noPreview, value: undefined },
      { key: "-t", cond: (timeout || -1) > -1, value: timeout },
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
    ];

    const command = `rpicam-still --camera ${this.camera} ${flags
      .filter((e) => e.cond)
      .map((e) => `${e.key}${e.value ? e.value : ""}`)
      .join(" ")} -w ${width} -h ${height} -o ${filename}`;

    return command;
  }
  reserve() {
    this.serveVideo("-", 0, "auto", 50, 50, "Reserve", { fps: 5 });
    this.reserved = true;
  }
  unlockReserve() {
    this.killTask("Reserve");
    this.reserved = false;
  }

  isReserved() {
    return this.reserved;
  }

  killTask(id: string, force: boolean = true) {
    if (this.tasks.some((e) => e.id == id)) {
      try {
        kill(this.tasks.find((e) => e.id == id)!.pid, force ? 15 : 9);
        return true;
      } catch (err) {
        return false;
      }
    }
  }
  killAllTasks(force?: boolean) {
    try {
      this.tasks.map((e) => kill(e.pid, force ? 15 : 9));
      return true;
    } catch (err) {
      return false;
    }
  }

  serveStillSync(
    filename: string,
    format: string | "auto" = "auto",
    width: number,
    height: number,
    options?: ICameraStillOptions & { stream?: boolean }
  ) {
    if (this.reserved) this.unlockReserve();
    const command = this._serveStill_params(
      filename,
      format,
      width,
      height,
      options
    );
    if (options?.stream) {
      const proc = spawn(command);
      return { stream: proc, success: true };
    }
    try {
      const execute = execSync(command);
      return {
        output: execute,
        error: undefined,
        success: true,
      };
    } catch (err) {
      return { output: undefined, error: err, success: false };
    } finally {
      if (this.options?.autoReserve) this.reserve();
    }
  }
  async serveStill(
    filename: string,
    format: string | "auto" = "auto",
    width: number,
    height: number,
    id: string,
    options?: ICameraStillOptions & { stream?: boolean }
  ) {
    if (this.reserved) this.unlockReserve();
    const command = this._serveStill_params(
      filename,
      format,
      width,
      height,
      options
    );

    if (this.tasks.some((e) => e.id == id))
      throw new Error("'serveStill' ,id must be unique!");

    if (options?.stream) {
      const proc = spawn(command);
      return { stream: proc, success: true };
    }

    return await new Promise((res, rej) => {
      this.tasks.push({
        pid:
          exec(command, (error, output) => {
            if (error) rej({ error, success: false });
            else if (output) {
              res({ output, success: true });
              this.tasks = this.tasks.filter((e) => e.id != id);
            }
          }).pid || -1,
        id,
      });
    }).finally(() => this.options?.autoReserve && this.reserve());
  }

  serveVideoSync(
    filename: string,
    timeout: number,
    format: string | "auto" = "auto",
    width: number,
    height: number,
    options?: ICameraVideoOptions & { stream?: boolean }
  ) {
    if (this.reserved) this.unlockReserve();
    const command = this._serveVideo_params(
      filename,
      timeout,
      format,
      width,
      height,
      options
    );
    try {
      if (options?.stream) {
        const proc = spawn(command);
        return { stream: proc, seccess: true };
      }
      const execute = execSync(command);

      return {
        output: execute,
        error: undefined,
        success: true,
      };
    } catch (err) {
      return { output: undefined, error: err, success: false };
    } finally {
      if (this.options?.autoReserve) this.reserve();
    }
  }
  async serveVideo(
    filename: string,
    timeout: number,
    format: string | "auto" = "auto",
    width: number,
    height: number,
    id: string,
    options?: ICameraVideoOptions & { stream?: boolean }
  ) {
    if (this.reserved) this.unlockReserve();

    const command = this._serveVideo_params(
      filename,
      timeout,
      format,
      width,
      height,
      options
    );
    if (this.tasks.some((e) => e.id == id))
      throw new Error("'serveVideo' ,id must be unique!");

    if (options?.stream) {
      const proc = spawn(command);
      return { stream: proc, success: true };
    }

    return await new Promise((res, rej) => {
      this.tasks.push({
        pid:
          exec(command, (error, output) => {
            if (error) rej({ error, success: false });
            else if (output) {
              res({ output, success: true });
              this.tasks = this.tasks.filter((e) => e.id != id);
            }
          }).pid || -1,
        id,
      });
    }).finally(() => this.options?.autoReserve && this.reserve());
  }

  serveLive(
    width: number,
    height: number,
    id: string,
    options: ICameraVideoOptions
  ) {
    if (this.reserved) this.unlockReserve();
    const [cmd, ...args] = this._serveVideo_params(
      "-",
      0,
      "",
      width,
      height,
      options
    ).split(" ");
    try {
      const process = spawn(cmd, args);
      this.tasks.push({ pid: process.pid || -1, id });
      this.live.emit("started");
      process.stdout.on("data", (frame) => {
        this.live.emit("frame", frame);
      });
      process.on("close", () => {
        this.live.emit("closed");
        if (this.options?.autoReserve) this.reserve();
      });
    } catch (err) {
      this.tasks.filter((e) => e.id != id);
    }
  }

  getAvailCameras() {
    const rawData = execSync("rpicam-still --list-cameras").toString();
    if (rawData.includes("No cameras available!")) return [];
    const lists = rawData
      .split("-----------------")
      .slice(1)
      .map((e) => {
        const [idx, data] = e.split(":").map((a) => a.trim());
        const [name, resolution, path] = data.split(" ");
        const [width, height] = resolution
          .replace("[", "")
          .replace("]", "")
          .split("x");

        return {
          index: Number(idx),
          name,
          resolution: { width: Number(width), height: Number(height) },
          path: path.replace("(", "").replace(")", ""),
        };
      });

    return lists;
  }
  isReadySync() {
    try {
      execSync("rpicam-still -t 10 -o -");
      return true;
    } catch (err) {
      return false;
    }
  }
  async isReady() {
    return await new Promise((res) => {
      exec("rpicam-still -t 10 -o -", (err) => (err ? res(false) : res(true)));
    });
  }
}
