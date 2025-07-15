import {
  spawn,
  exec,
  execSync,
  ChildProcessWithoutNullStreams,
} from "node:child_process";
import { kill } from "node:process";
import type {
  ICameraDescriptor,
  ICameraOptions,
  ICameraStillOptions,
  ICameraVideoOptions,
  IOutputException,
} from "./interfaces/index";
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

  /** @type {{ id: string; pid: number }[]} */
  /**@prop `tasks` is current async opreations running on camera with pid and id.*/
  public tasks: { id: string; pid: number }[];

  /** @type {LiveMode} */
  /** @prop live streaming of camera comes to `live` event emitter of class.*/
  public live: LiveMode = new LiveMode();

  /**
   * @constructor class of `RPICam`, also this constructor can wait until camera get ready.
   * @param {number} camera is number of camera to get in use.
   * @param {ICameraOptions} options is avail options and formatting and setting camera by manual and method of capturing.
   */
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
      .join(" ")} -w ${width} -h ${height} ${filename ? `-o ${filename}` : ""}`;

    return command;
  }

  private _serveVideo_params(
    filename: string,
    timeout: number,
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
      .join(" ")} -w ${width} -h ${height} ${filename ? `-o ${filename}` : ""}`;

    return command;
  }

  /**
   * Reserve camera to not get in use of other process by opening a infinite and cancellable stream of recording.
   * @returns {Promise<IOutputException>} reservation status.
   */
  async reserve(): Promise<IOutputException> {
    return new Promise<IOutputException>(async (res, rej) => {
      if (!this.isReadySync())
        rej({
          success: false,
          error: {
            name: "CAMERA_BUSY_ALREADY",
            readable:
              "Can not reserve camera because is busy (in use of other process).",
          },
        });

      const resp = await this.serveVideo("-", 0, 50, 50, "Reserve", {
        fps: 5,
      });
      res({ success: resp.success });
    });
  }

  /**
   * kills process of reservation of camera and make it free.
   * @returns {IOutputException} status of unlocking camera.
   */

  unlockReserve(): IOutputException {
    if (!this.reserved)
      return {
        success: false,
        error: {
          readable: "Camera should be reserved to unlock!",
          name: "NOT_RESERVED",
        },
      };
    return this.killTask("Reserve");
  }

  /**
   * Check reservation of camera by this process.
   * @returns {boolean} is reserved or not.
   */

  isReserved(): boolean {
    return this.reserved;
  }

  /**
   * Kills a async task opreation of camera.
   * @param {string} id is a custom id to call it everywhere and should be unique or get a error.
   * @param {boolean} force to kill a task or not, forcing sends a SIGKILL code to a task but, else sends a SIGTERM code to process.
   * @returns {IOutputException} status of killing a process, if id not exists, returns a error response, but else, throw a error.
   */

  killTask(id: string, force: boolean = true): IOutputException {
    if (this.tasks.some((e) => e.id == id)) {
      try {
        kill(this.tasks.find((e) => e.id == id)!.pid, force ? 9 : 15);
        return { success: true };
      } catch (err) {
        throw err;
      }
    }
    return {
      success: false,
      error: { readable: "id not exists in tasks!", name: "BAD_ID" },
    };
  }
  /**
   *
   * @ * @param {boolean} force to kill a task or not, forcing sends a SIGKILL code to a task but, else sends a SIGTERM code to processes.
   * @returns {IOutputException} status of killing all process,if error detected, throw a error.
   */

  killAllTasks(force?: boolean): IOutputException {
    try {
      this.tasks.map((e) => kill(e.pid, force ? 9 : 15));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: {
          readable: `An error detected while trying to kill all tasks!\nerr: ${err}`,
          name: "KILLING_ALL_ID_ERROR",
        },
      };
    }
  }

  /**
   * Same as `serveStill` but is sync.
   * @param {string} filename is path of saving image, also is okay set it to empty string for streaming options and everything like stream should not be outputed on a file or use `serveStillCutomSync` to set everything manually.
   * @param {number} width (no description needed)
   * @param {number} height (no description needed)
   * @param { ICameraStillOptions & { stream?: boolean }} options of serving (full settings and options of camera and rpicam).
   * @returns {IOutputException} capturing status or stream event emitter output.
   */

  serveStillSync(
    filename: string,
    width: number,
    height: number,
    options?: ICameraStillOptions & { stream?: boolean }
  ): IOutputException {
    if (this.reserved) this.unlockReserve();
    const command = this._serveStill_params(filename, width, height, options);
    if (options?.stream) {
      const proc = spawn(command);
      return { output: proc, success: true };
    }
    try {
      const execute = execSync(command);
      return {
        output: execute,
        error: undefined,
        success: true,
      };
    } catch (err) {
      throw err;
    } finally {
      if (this.options?.autoReserve) this.reserve();
    }
  }
  /**
   * Same as `serveStillCustom` but is sync.
   * @param {number} width (no description needed)
   * @param {number} height (no description needed)
   * @param { ICameraStillOptions & {stream?: boolean,output?: string,format?: string}} options of serving (full settings and options of camera and rpicam).
   * @returns {IOutputException} capturing status or stream event emitter output.
   */

  serveStillCustomSync(
    width: number,
    height: number,
    options?: ICameraStillOptions & {
      stream?: boolean;
      output?: string;
      format?: string;
    }
  ): IOutputException {
    if (this.reserved) this.unlockReserve();
    const command = this._serveStill_params(
      options?.output || "",
      width,
      height,
      options
    );
    if (options?.stream) {
      const proc = spawn(command);
      return { output: proc, success: true };
    }
    try {
      const execute = execSync(command);
      return {
        output: execute,
        error: undefined,
        success: true,
      };
    } catch (err) {
      throw err;
    } finally {
      if (this.options?.autoReserve) this.reserve();
    }
  }

  /**
   * Same as `serveStill` But everything except some required things must setted manually.
   * @param {number} width (no description needed)
   * @param {number} height (no description needed)
   * @param {string} id of task for managing.
   * @param { ICameraStillOptions & {stream?: boolean,output?: string,format?: string}} options of serving (full settings and options of camera and rpicam).
   * @returns { Promise<IOutputException>} capturing status or stream event emitter output (as a `Promise`).
   */

  async serveStillCustom(
    width: number,
    height: number,
    id: string,
    options?: ICameraStillOptions & {
      stream?: boolean;
      output?: string;
      format?: string;
    }
  ): Promise<IOutputException> {
    if (this.reserved) this.unlockReserve();
    const command = this._serveStill_params(
      options?.output || "",
      width,
      height,
      options
    );

    if (this.tasks.some((e) => e.id == id))
      throw new Error("'serveStill' ,id must be unique!");

    if (options?.stream) {
      const proc = spawn(command);
      return { output: proc, success: true };
    }

    return await new Promise<IOutputException>((res, rej) => {
      this.tasks.push({
        pid:
          exec(command, (error, output) => {
            if (error)
              rej({
                error: {
                  readable: `An error in capturing still on camera!\nerr: ${error}`,
                  name: "CAMERA_STILLING_INTERNAL_ERROR",
                },
                success: false,
              });
            else if (output) {
              res({ output, success: true });
              this.tasks = this.tasks.filter((e) => e.id != id);
            }
          }).pid || -1,
        id,
      });
    }).finally(() => this.options?.autoReserve && this.reserve());
  }

  /**
   * Same as `serveVideoCustom` but is sync.
   * @param {number} timeout of capturing or time argument of streams and other stuff needs time.
   * @param {number} width (no description needed)
   * @param {number} height (no description needed)
   * @param {ICameraVideoOptions & { stream?: boolean, output?: string }} options of serving (full settings and options of camera and rpicam).
   * @returns {IOutputException} capturing status or stream event emitter output.
   */

  serveVideoCustomSync(
    timeout: number,
    width: number,
    height: number,
    options?: ICameraVideoOptions & { stream?: boolean; output?: string }
  ): IOutputException {
    if (this.reserved) this.unlockReserve();
    const command = this._serveVideo_params(
      options?.output || "",
      timeout,
      width,
      height,
      options
    );
    try {
      if (options?.stream) {
        const proc = spawn(command);
        return { output: proc, success: true };
      }
      const execute = execSync(command);

      return {
        output: execute,
        error: undefined,
        success: true,
      };
    } catch (err) {
      throw err;
    } finally {
      if (this.options?.autoReserve) this.reserve();
    }
  }

  /**
   * Same as `serveVideo` But everything except some required things must setted manually.
   * @param {number} timeout of capturing or time argument of streams and other stuff needs time.
   * @param {number} width (no description needed)
   * @param {number} height (no description needed)
   * @param {string} id of task for managing.
   * @param {ICameraVideoOptions & { stream?: boolean, output?: string }} options of serving (full settings and options of camera and rpicam).
   * @returns {Promise<IOutputException>} capturing status or stream event emitter output (as a `Promise`).
   */

  async serveVideoCustom(
    timeout: number,
    width: number,
    height: number,
    id: string,
    options?: ICameraVideoOptions & { stream?: boolean; output?: string }
  ): Promise<IOutputException> {
    if (this.reserved) this.unlockReserve();

    const command = this._serveVideo_params(
      options?.output || "",
      timeout,
      width,
      height,
      options
    );
    if (this.tasks.some((e) => e.id == id))
      throw new Error("'serveVideo' ,id must be unique!");

    if (options?.stream) {
      const proc = spawn(command);
      return { output: proc, success: true };
    }

    return await new Promise<IOutputException>((res, rej) => {
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

  /**
   * Takes a photo and save it into a file (powered by `rpicam-still`).
   * @param {string} filename is path of saving image, also is okay set it to empty string for streaming options and everything like stream should not be outputed on a file or use `serveStillCutomSync` to set everything manually.
   * @param {number} width of resolution.
   * @param {number} height of resolution.
   * @param {string} id of task for managing.
   * @param { ICameraStillOptions & { stream?: boolean }} options of serving (full settings and options of camera and rpicam).
   * @returns {Promise<IOutputException>} capturing status or stream event emitter output (as a `Promise`).
   */

  async serveStill(
    filename: string,
    width: number,
    height: number,
    id: string,
    options?: ICameraStillOptions & { stream?: boolean }
  ): Promise<IOutputException> {
    if (this.reserved) this.unlockReserve();
    const command = this._serveStill_params(filename, width, height, options);

    if (this.tasks.some((e) => e.id == id))
      throw new Error("'serveStill', id must be unique!");

    if (options?.stream) {
      const proc = spawn(command);
      return { output: proc, success: true };
    }

    return await new Promise<IOutputException>((res, rej) => {
      this.tasks.push({
        pid:
          exec(command, (error, output) => {
            if (error)
              rej({
                error: {
                  readable: `An error in capturing still on camera!\nerr: ${error}`,
                  name: "CAMERA_STILLING_INTERNAL_ERROR",
                },
                success: false,
              });
            else if (output) {
              res({ output, success: true });
              this.tasks = this.tasks.filter((e) => e.id != id);
            }
          }).pid || -1,
        id,
      });
    }).finally(() => this.options?.autoReserve && this.reserve());
  }

  /**
   * Same as `serveVideo` but is sync.
   * @param {string} filename is path of saving video, also is okay set it to empty string for streaming options and everything like stream should not be outputed on a file or use `serveVideoCutomSync` to set everything manually.
   * @param {number} width of resolution.
   * @param {number} height of resolution.
   * @param { ICameraStillOptions & { stream?: boolean }} options of serving (full settings and options of camera and rpicam).
   * @returns {Promise<IOutputException>} capturing status or stream event emitter output.
   */

  serveVideoSync(
    filename: string,
    timeout: number,
    width: number,
    height: number,
    options?: ICameraVideoOptions & { stream?: boolean }
  ): IOutputException {
    if (this.reserved) this.unlockReserve();
    const command = this._serveVideo_params(
      filename,
      timeout,
      width,
      height,
      options
    );
    try {
      if (options?.stream) {
        const proc = spawn(command);
        return { output: proc, success: true };
      }
      const execute = execSync(command);

      return {
        output: execute,
        error: undefined,
        success: true,
      };
    } catch (err) {
      throw err;
    } finally {
      if (this.options?.autoReserve) this.reserve();
    }
  }

  /**
   * Capture a video and save it into a file (powered by `rpicam-vid`).
   * @param {string} filename is path of saving video, also is okay set it to empty string for streaming options and everything like stream should not be outputed on a file or use `serveVideoCutomSync` to set everything manually.
   * @param {number} width of resolution.
   * @param {number} height of resolution.
   * @param {string} id of task for managing.
   * @param { ICameraStillOptions & { stream?: boolean }} options of serving (full settings and options of camera and rpicam).
   * @returns {Promise<IOutputException>} capturing status or stream event emitter output (as a `Promise`).
   */

  async serveVideo(
    filename: string,
    timeout: number,
    width: number,
    height: number,
    id: string,
    options?: ICameraVideoOptions & { stream?: boolean }
  ): Promise<IOutputException> {
    if (this.reserved) this.unlockReserve();

    const command = this._serveVideo_params(
      filename,
      timeout,
      width,
      height,
      options
    );
    if (this.tasks.some((e) => e.id == id))
      throw new Error("'serveVideo' ,id must be unique!");

    if (options?.stream) {
      const proc = spawn(command);
      return { output: proc, success: true };
    }

    return await new Promise<IOutputException>((res, rej) => {
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

  /**
   * Start a live stream, load stream to `live` property or access it via return value (is similar to event emitter, and powered by `serveVideo`).
   * @param width (no description needed)
   * @param height (no description needed)
   * @param id of task for managing.
   * @param options of serving (full settings and options of camera and rpicam).
   * @returns {ChildProcessWithoutNullStreams } spawn stream of node:child_process.
   */

  serveLive(
    width: number,
    height: number,
    id: string,
    options: ICameraVideoOptions
  ): ChildProcessWithoutNullStreams {
    if (this.reserved) this.unlockReserve();
    const [cmd, ...args] = this._serveVideo_params(
      "-",
      0,
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
      return process;
    } catch (err) {
      this.tasks.filter((e) => e.id != id);
      throw err;
    }
  }

  /**
   * Gets list of avail camera (connected cameras).
   * @returns {ICameraDescriptor[]} list of cameras, must be empty if nothing connected.
   */

  static getAvailCameras(): ICameraDescriptor[] {
    const rawData = execSync("rpicam-hello --list-cameras").toString();
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

  /**
   * Same as `isReady` but is sync.
   * @returns {Promise<boolean>} ready status by boolean.
   */
  isReadySync(): boolean {
    try {
      execSync("rpicam-still -t 10 -o -");
      return true;
    } catch (err) {
      return false;
    }
  }
  /**
   * Checks is Camera ready or not by testing a simple rpicam-still on camera (purpose of testing is to check is connected okay or is free or not).
   * @returns {Promise<boolean>} ready status by boolean (as a`Promise`).
   */
  async isReady(): Promise<boolean> {
    return await new Promise((res) => {
      exec("rpicam-still -t 10 -o -", (err) => (err ? res(false) : res(true)));
    });
  }
}
