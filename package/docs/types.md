# Types

All types with all details explained in this page.

### Table of content

- [Table of content](#table-of-content)
- [Framing options](#framing-options)
  - [`ICameraStillOptions` (introduction)](#icamerastilloptions-introduction)
  - [`ICameraVideoOptions` (introduction)](#icameravideooptions-introduction)
  - [`ICameraCommonOptions`](#icameracommonoptions)
  - [`ICameraStillOptions`](#icamerastilloptions)
  - [`ICameraVideoOptions`](#icameravideooptions)
- [Methods](#methods)
  - [`serveStill`](#servestill)
  - [`serveStillSync`](#servestillsync)
  - [`serveStillCustom`](#servestillcustom)
  - [`serveStillCustomSync`](#servestillcustomsync)
  - [`serveVideo`](#servevideo)
  - [`serveVideoSync`](#servevideosync)
  - [`serveVideoCustom`](#servevideocustom)
  - [`serveVideoCustomSync`](#servevideocustomsync)
  - [`serveLive`](#servelive)
  - [`wait`](#wait)
  - [`waitSync`](#waitsync)
  - [`isReady`](#isready)
  - [`isReadySync`](#isreadysync)
  - [`reserve`](#reserve)
  - [`unlockReserve`]()
  - [`isReserved`]()

## Framing options

Serving **video**, **still** and **live** somtimes must use advanced options like **adding effects**, activating **denoiser**, setting **iso**, **rotation** and more, these options are possible with `options` arguemnt in _serve_ methods.

Option types includes:

- #### `ICameraStillOptions` (Introduction):

  options for serving **Still** (or _image_) called `ICameraStillOptions`.

- #### `ICameraVideoOptions` (Introduction):

  options for serving **Videos** (or _any stream contains video capturing_) called `ICameraVideoOptions`.

- #### `ICameraCommonOptions`:

  common props of `ICameraStillOptions` and `ICameraVideoOptions` types (_interfaces_) called `ICameraCommonOptions`.

  _note:_ `ICameraCommonOptions`, is accessable but _rarely_ you need to use it.

  Properties includes:

  - `timeout` [ `number` ]: any timing parameters (like _delay_, _preview time_, _duration_ and more) in milliseconds.

  - `noPreview` [ `boolean` ]: Do not show preview before serving.

  - `contrast` [ `number` ]: **contrast effect** of serving, _value must be betwen 0 and 100 (like percentage)_.

  - `sharpness` [ `number` ]: **sharpness effect** of serving, _value must be betwen 0 and 100 (like percentage)_.

  - `brightness` [ `number` ]: **brightness effect** of serving, _value must be betwen 0 and 100 (like percentage)_.

  - `rotation` [ `0 | 90 | 180 | 270` ]: **Rotation effect** of serving.

  - `flipHorizontal` [ `boolean` ]: flipping frame(s) horizontally.

  - `flipVertical` [ `boolean` ]: flipping frame(s) vertically.

  - `denoise` [ `boolean` ]: activating **denoising** (its a image effect).

  - `effect` [ ` "none"
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
    | "cartoon"` ]: **filter effect** of serving.

  - `zoom` [ `"1x" | "2x" | "3x" | "4x" | "5x" | "6x" | "7x" | "8x" | "9x" | "10x"` ]: **digital zoom** of serving.

  - `exposureCompensation` [ `number` ]: **exposure compensation (ev) effect** of serving, _value must be betwen -10 and 10_.

  - `saturation` [ `number` ]: **saturation effect** of serving, _value must be betwen 0 and 100 (like percentage)_.

  - `autoFocusOnCapture` [ `boolean` ]: auto focus when capturing.

  - `autoFocusModeRange` [ `"macro" | "normal"` ]: auto focus ranging mode.

  - `initialCommand` [ `string` ]: command running right before executing capturing command.

  - `finalCommand` [ `string` ]: command running after executing capturing command.

  - `mode` [ `string` ]: hardware reading pixels method from sensor, or in other words, how your data read physically from camera sensor, its same to `--mode` in `rpicam-app-lite`.

    _note 1:_ the `mode` option controls **how your camera's sensor physically reads out data**. It's not just about the final image size; it specifies the exact **resolution, bit depth, and data packing** the sensor uses. This allows you to access specific sensor capabilities, like different frame rates or unique cropping, by directly selecting a predefined sensor mode.

    format of `mode` property: `<width>:<height>:<bit-depth>:<packing>`

    - `<width>`: The horizontal resolution (in pixels) the sensor will read.
    - `<height>`: The vertical resolution (in pixels) the sensor will read.
    - `<bit-depth>`: The number of bits per pixel, determining color accuracy (e.g., 8, 10, or 12 bits).
    - `<packing>`: How the raw pixel data is organized (e.g., `P` for packed, `U` for unpacked).

    _note 2:_ also you can run `rpicam-hello --list-modes` to check your modes, library does not support listing modes cause of **inefficienty**, **complexity** and library always trying to stay balance with **beginners** and **professional**.

  - `awb` [ `"auto"
    | "off"
    | "sun"
    | "cloud"
    | "shade"
    | "tungsten"
    | "fluorescent"
    | "incandescent"
    | "flash"
    | "incandescent"` ]: **AWB** or **Auto White Balance** effect of serving.

  - `iso` [ `100 | 200 | 400 | 800 | 1600 | 3200 | 6400 | 12800 | 25600` ]: **ISO effect** of serving.

    _note:_ **ISO** controls your camera's **sensitivity to light**. A **low ISO** (like 100) means less sensitivity, giving you a **cleaner image** with less digital noise, ideal for bright conditions. A **high ISO** (like 1600) means more sensitivity, allowing you to capture images in low light, but it will introduce **more digital noise** (graininess) into your photo or video. It's a trade-off: more light sensitivity often means more noise.

  - `signal` [ `string` ]: waits until receive a special signal, then start serving, like `signal: "SIGUSR1"`.

  - `awbgains` [ `string` ]: **AWB Gain effect** of serving.
    _note:_ means setting values of **red** and **blue** manually, format of this property value its like: `<red>,<blue>`, and value range is betwen **0.0** ~ **10.0** or **8.0**.

  - `datetime` [ `boolean` ]: add datetime at the end of output filename.

  - `metadata` [ `boolean` ]: save metadata, like **location** (if support), **datetime** and more.

  - `format` [ `string | "auto"` ]: format of output file.

- #### `ICameraStillOptions`:

  - `burst` [ `boolean` ]: take burst shots.
  - `timelapse` [ `number` ]: timelaps of `burst` mode.
  - `quality` [ `number ` ]: output file quality and data loss, lower `quality` means more compressing and data loss, higher `quality` least data loss and more size, _value must be betwen 0 and 100 (like percentage)_.

- #### `ICameraVideoOptions`:

  - `fps` [ `number` ]: fps of video serving, (set it carefully, because affect on system resources usage).
    _note:_ fps means **Frames per Seconds** or _frames/second_.

  - `bitrate` [ `number` ]: bitrate of video serving (not means _fps_, its something deeply in camera sensors and digital chips).

  - `codec` [ `"h264" | "mjpeg" | "yuv420" | "h265"` ]: output video codec.

  - `circularMode` [ `boolean` ]: after timeout reaches end, frame overwrite from **oldest** to **latest**, like _dashcams_ in cars.

  - `maxFileSize` [ `number` ]: maximum file size of output, if output file exceeds size limit, ignores timeout, stop serving and saves (if has output).

    _note:_ example value: `{maxFileSize: "1M"}`

  - `saveParts` [ `string` ]: report each frames with timestamp in a file, report filename its value of this property (is same to `--save-pts` in `rpicam-apps-lite`).

  - `codecProfile` [ `"high" | "main"` ]: profile of output codec.

  - `codecLevel` [ `string` ]: level of codec, example: `{codecLevel: "3.1"}`.

  - `instra` [ `number` ]: each _n_ frames, inserts **I-Frame** to output.

## Methods

Methods with arguments (with types) and outputs Explained.

_note:_ all methods functionality explained before.

methods includes:

- #### `serveStill`:

  ```ts
  RPICam.serveStill(
   filename: string,
   width:number, height:number,
   id: string,
   options?: ICameraStillOptions & { stream?: boolean }
  ): Promise<IOutputException>
  ```

- #### `serveStillSync`:

  ```ts
  RPICam.serveStilSync(
   filename: string,
   width:number, height:number,
   options?: ICameraStillOptions & { stream?: boolean }
  ): IOutputException
  ```

- #### `serveStillCustom`:

  ```ts
  RPICam.serveStillCustom(
   width: number, height: number,
   id: string,
   options?: ICameraStillOptions & {
      stream?: boolean;
      output?: string;
      format?: string;
    }
  ): Promise<IOutputException>
  ```

- #### `serveStillCustomSync`:

  ```ts
  RPICam.serveVideoCustomSync(
    timeout: number,
    width: number, height: number,
    options?: ICameraVideoOptions & { stream?: boolean; output?: string }
  ): IOutputException
  ```

- #### `serveVideo`:

  ```ts
  RPICam.serveVideo(
    filename: string,
    timeout: number,
    width: number, height: number,
    id: string,
    options?: ICameraVideoOptions & { stream?: boolean }
  ): Promise<IOutputException>
  ```

- #### `serveVideoSync`:

  ```ts
  RPICam.serveVideoSync(
    filename: string,
    timeout: number,
    width: number, height: number,
    options?: ICameraVideoOptions & { stream?: boolean }
  ): IOutputException
  ```

- #### `serveVideoCustom`:

  ```ts
  serveVideoCustom(
    timeout: number,
    width: number, height: number,
    id: string,
    options?: ICameraVideoOptions & { stream?: boolean; output?: string }
  ): Promise<IOutputException>
  ```

- #### `serveVideoCustomSync`:

  ```ts
  RPICam.serveVideoCustomSync(
    timeout: number,
    width: number, height: number,
    options?: ICameraVideoOptions & { stream?: boolean; output?: string }
  ): IOutputException
  ```

- #### `serveLive`:

  ```ts
  RPICam.serveLive(
    width: number, height: number,
    id: string,
    options: ICameraVideoOptions
  ): ChildProcessWithoutNullStreams
  // Return type is a child process,
  // somthing like spawn and exec from node:child_process.
  ```

- #### `wait`:

  ```ts
  RPICam.wait(timeout: number = Infinity): Promise<IOutputException>
  ```

- #### `waitSync`:

  ```ts
  RPICam.waitSync(timeout: number = Infinity): IOutputException
  ```

- #### `isReady`:

  ```ts
  RPICam.isReady(): Promise<boolean>
  ```

- #### `isReadySync`:

  ```ts
  RPICam.isReadySync(): boolean
  ```

- #### `reserve`:

  ```ts
  RPICam.reserve(): Promise<IOutputException>
  ```

- #### `unlockReserve`:

  ```ts
  RPICam.unlockReserve(): IOutputException
  ```

- #### `isReserved`:
  ```ts
  RPICam.isReserved(): boolean
  ```
