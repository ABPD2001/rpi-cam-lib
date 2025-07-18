import type {
  ICameraDescriptor,
  ICameraOptions,
  ICameraStillOptions,
  ICameraVideoOptions,
  IOutputException,
} from "./interfaces/index";
import {
  spawn,
  exec,
  execSync,
  ChildProcessWithoutNullStreams,
} from "node:child_process";
import { EventEmitter } from "node:events";
import { _serveStill_params, _serveVideo_params } from "./utils/serveArgs";
import { Taskman } from "./common";

class LiveMode extends EventEmitter {
  constructor() {
    super();
  }
}
export class RPICam extends Taskman {
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
   * @constructor constructor of `RPICam`.
   * @param {number} camera is number of camera to get in use.
   * @param {ICameraOptions} options is avail options and formatting and setting camera by manual and method of capturing.
   */
  constructor(camera: number, options?: ICameraOptions) {
    super();
    this.camera = camera;
    this.tasks = [];
    this.options = options;
    if (options?.autoReserve && this.isReadySync()) {
      this.reserve();
    }
  }

  /**
   * Reserve the camera to prevent it from being used by other processes by opening an infinite and cancellable recording stream.
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

      const { success } = await this.serveVideoCustom(0, 50, 50, "Reserve", {
        fps: 5,
        stream: true,
        output: "-",
      });

      this.reserved = success;
      res({ success });
    });
  }

  /**
   * Kills process of reservation of camera and make it free.
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
    const command = _serveStill_params(
      this.camera,
      filename,
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
    const command = _serveStill_params(
      this.camera,
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
   * @param {ICameraStillOptions & {stream?: boolean,output?: string,format?: string}} options of serving (full settings and options of camera and rpicam).
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
    const command = _serveStill_params(
      this.camera,
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
    const command = _serveVideo_params(
      this.camera,
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

    const command = _serveVideo_params(
      this.camera,
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
   * It takes a photo and saves it to a file (powered by rpicam-still).
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
    const command = _serveStill_params(
      this.camera,
      filename,
      width,
      height,
      options
    );

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
    const command = _serveVideo_params(
      this.camera,
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
   * Capture a video and save it to a file (powered by rpicam-vid).
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

    const command = _serveVideo_params(
      this.camera,
      filename,
      timeout,
      width,
      height,
      options
    );
    if (this.tasks.some((e) => e.id == id))
      throw new Error("'serveVideo', id must be unique!");

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
   * Start a live stream, load the stream to the `live` property or access it via the return value (this is similar to an event emitter and is powered by `serveVideo`).
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
    const [cmd, ...args] = _serveVideo_params(
      this.camera,
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
   * Gets list of available camera (connected cameras).
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
      execSync(`rpicam-still --camera ${this.camera} -t 10 -o -`);
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
      exec(`rpicam-still --camera ${this.camera} -t 10 -o -`, (err) =>
        err ? res(false) : res(true)
      );
    });
  }
}
