# Technicals

_Technical things documentioned here._

## Table of content

- [Table of content](#table-of-content)
- [Types](#types)
- [Properties](#properties)
  - [`tasks`](#tasks)
  - [`live`](#live)
  - [`waiting`](#waiting)
- [Serves](#serves)
  - [`serveStill`](#servestill)
  - [`serveStillSync`](#servestillsync)
  - [`serveStillCustom`](#servestillcustom)
  - [`serveStillCustomSync`](#servestillcustomsync)
  - [`serveVideo`](#servevideo)
  - [`serveVideoSync`](#servevideosync)
  - [`serveVideoCustom`](#servevideocustom)
  - [`serveVideoCustomSync`](#servevideocustomsync)
  - [Examples](#examples-for-serves)
- [Streams](#streams)
  - [`serveLive`](#servelive)
  - [Examples](#examples-for-streams)
- [Stats](#stats)
  - [`isReady`](#isready)
  - [`isReadySync`](#isreadysync)
  - [Examples](#examples-for-stats)
- [Reservations](#reservations)
  - [`killTask`](#killtask)
  - [`killAllTasks`](#killalltasks)
  - [`reserve`](#reserve)
  - [`unlockReserve`](#unlockreserve)
  - [`wait`](#wait)
  - [`waitSync`](#waitsync)
  - [Examples](#examples-for-reservation)

The `RPICam` is the main class for using the Raspberry Pi camera. This class has a constructor that takes two arguments:

1. **Camera Index** [ `number` ]: Selects which camera to use.

2. **Options** [ `{autoReserve?: boolean}` ]: Currently, there is only one property in this argument called `autoReservation`, which automatically reserves and releases the camera.

_note:_ its **important** to know, there is a _static_ method named `getAvailCameras`, it used to get current available cameras (output type is `ICameraDescriptor[]` ).

### Types

all _types_ explained in **[docs/types.md](https://github.com/ABPD2001/rpi-cam-lib/blob/main/package/docs/types.md)** with more details.

### Properties

`RPICam` class includes two property:

- `tasks` [ `{pid: number, id: string} []` ]: current running _async_ tasks for managing them with `killTask` or `killAllTasks` or manage it directly by _process id_.

- `live` [ extends `EventEmitter` ]: When you start a live stream with the `serveLive` method, it provides output in two ways:

  - The **first output** is in the return value, which is a process type, or more specifically, a `ChildProcessWithoutNullStreams`.

  - The **second output** is available in a property called `live`. This property, via an `EventEmitter`, provides each live frame as a buffer using events.

  - Whenever the live stream starts, the **`started`** event occurs.
  - Whenever a frame is received, the **`frame`** event occurs.
    And whenever the stream is disconnected, the **`closed`** event occurs.

  _note:_ Examples for this property covered later in [`serveLive`](#examples-for-streams) examples.

- `waiting` [ `boolean` ]: this property has two usage, first usage its using as controlling `wait` and `waitSync` methods (we cover it later), seconds usage its for checking current process is waiting for camera or not.

### Serves

Some methods are responsible for **Serving** content through the camera, like serving a live stream or a photo. These methods include:

- #### `serveStill`:

  This is an **Asynchronous Method** responsible for _serving_ or, in other words, saving a photo. This method takes five arguments:

  - `filename` [ `string` ]: The name of the output file is same to `-o filename` in `rpicam-still` from `rpicam-apps-lite`.

  - `width`: [ `number` ]: The width of the capture (in pixels) resolution.
  - `height`: [ `number` ]: The height of the capture (in pixels) resolution.
  - `id`: [ `string` ]: The name of the task saved by this method (for task management).
  - `options` [ `ICameraStillOptions & { stream?: boolean }` ]: A set of capabilities that allow changing the `capture method`, `image effects`, `zoom`, and more. You can read the complete set of these capabilities in the [Types](#types) section.

- #### `serveStillSync`:

  This is a **Synchronous** method of `serveStill`, but instead of five arguments, it takes four arguments, with only the `id` argument removed.(The arguments include `filename`,`width`, `height`, and `options`).

- #### `serveStillCustom`:
  This is also an **Asynchronous** method modeled after `serveStill`, but everything, including the output filename, must be configured manually. In other words, it offers the closest interaction with the shell through the class. The `id` and `filename` arguments have been removed from this method. (The arguments include `width`, `height`, and `options`).

_note:_ `options` type is `ICameraStillOptions & {stream?: boolean, output?: string, format?: string}`.

- #### `serveStillCustomSync`:

  This method is the synchronous version of `serveStillCustom`. It takes `width`, `height`, and `options` as arguments, with the `id` argument removed.

- #### `serveVideo`:

  This is an **Asynchronous method** that _Serves_ or, in other words, **saves a video**. This method takes six arguments:

  - `filename` [ `string` ]: The name of the output file is same to `-o filename` in `rpicam-still` from `rpicam-apps-lite`.

  - `timeout` [ `number` ]: The duration of the video recording or any time-related parameter (for specific configurations), also is in _milliseconds_.
  - `width` [ `number` ]: The width of the resolution (in pixels).
  - `height` [ `number` ]: The height of the resolution (in pixels).
  - `id` [ `string` ]: The name of the task saved by this method (for task management).
  - `options` [ `ICameraVideoOptions & { stream?: boolean }` ]: Allows for configuring capabilities such as changing the **recording mode**, **zooming**, **image effects**, and more.

- #### `serveVideoSync`:

  This method is the **Asynchronous method** of `serveVideo`, with the `id` argument removed. (The arguments include `filename`, `timeout`, `width`, `height` and `options`).

- #### `serveVideoCustom`:

  This method is inspired by `serveVideo`, but everything must be configured manually, including the output and duration. The `filename` and `timeout` arguments have been removed. The arguments are, in order, `width`, `height`, `id` and `options`.

  _note:_ `options` type is `ICameraVideoOptions & {stream?: boolean, output?: string, format?: string, timeout?: number}`.

- #### `serveVideoCustomSync`:

  This method is the **Synchronous Method** of `serveVideoCustom`, with the `id` argument removed. The arguments are, in order, `width`, `height`, and `options`.

- ### Examples for serves

  _note:_ you must import `RPICam` and evaluate **constructor method**, we use `camera` variable as evaluated `RPICam` constructor.

  Example #1 for `serveStill`:

  ```ts
  camera.serveStill("myImage.jpg", 1280, 768, "my-still");
  /* myImage.jpg, is filename or path.
  1280 is width and 768 is height.
  my-still is id.*/
  ```

  Example #2 for `serveStill`:

  ```ts
  camera.serveStill("myImage2.jpg", 1280, 768, "my-still-with-options", {
    timeout: 2000,
  });
  /* timeout in options is about preview time before capturing, also you can add noPreview for no previewing and just waiting for timeout reaches end. */
  ```

  Example for `serveStillSync` (arguments explained in past examples):

  ```ts
  camera.serveStillSync("myImage.jpg", 1280, 768);
  /* if you look more wisely, you see id removed and its not argument anymore.*/
  ```

  Example for `serveStilCustom`:

  ```ts
  camera.serveStillCustom(1280, 768, "my-still-custom", {
    output: "myImage.jpg",
  });
  /* 1280 is width and 768 is height and my-still-custom is id. *
  /* usage is same to serveStill but should set everything as option except width and height and id. */
  ```

  Example for `serveStilCustomSync` (arguments explained is past examples):

  ```ts
  camera.serveStillCustom(1280, 768, { output: "myImage.jpg" });
  /* if you look wisely, you see id is removed and its not argument anymore.*/
  ```

  Example 1# for `serveVideo`:

  ```ts
  camera.serveVideo("myVideo.h264", 3000, 1280, 768, "my-video");
  /*
  myVideo.h264 is filename or path.
  3000 (ms) is timeout or duration, 1280 is width and 768 is height.
  my-video is id.
  last argument is options, like fps and others... 
  */
  ```

  Example 2# for `serveVideo`:

  ```ts
  camera.serveVideo("myVideo.h264", 3000, 1280, 768, "my-video", { fps: 30 });
  /* fps is a option you can add. (fps: frames per seconds or frames/seconds) */
  ```

  Example for `serveVideoSync`:

  ```ts
  camera.serveVideoSync("myVideo.h264", 3000, 1280, 768, { fps: 30 });
  /* if you look wisely, id is removed and its not argument anymore. */
  ```

  Example for `serveVideoCustom`:

  ```ts
  camera.serveVideoCustom(1280, 768, "my-video-custom", {
    timeout: 3000,
    output: "myVideo.h264",
  });

  /* 1280 is width and 768 is height and my-video-custom is id.*/
  /* usage is same to serveVideo but should set everything as option except width and height and id. */
  ```

  Example for `serveVideoCustomSync`:

  ```ts
  camera.serveVideoCustomSync(1280, 768, {
    timeout: 3000,
    output: "myVideo.h264",
  });

  /* if you look wisely, you see id is removed and its not argument anymore. */
  ```

  _note:_ All **Asynchronous** methods, `id` is a required argument.

### Streams

Some methods (for now is only one), are responsible for streaming frames, they includes:

- #### `serveLive`:

  This is an **Asynchronous method** that starts a live stream whenever it's called. (To access the live stream, you should use the `live` property in the `RPICam` class or the function's return value, as explained previously.) It takes the following arguments:

  - `width` [ `number` ]: The width of the stream resolution (by pixels).
  - `height` [ `number` ]: The height of the stream resolution (by pixels).
  - `id` [ `string` ]: The name of the task that will be created by this method, used for task management.
  - `options` [ `ICameraVideoOptions` ]: Capabilities that affect the stream, such as **image effects** and more.

  ### Examples for streams

  _note:_ You should evaluate `RPICam` constructor before use this examples, also we imagine `camera` variable is `RPICam` class with evaluated constructor.

  Example 1# for `serveLive`:

  ```ts
  camera.serveLive(1280, 768, "my-live-stream");
  /* 1280 is width, 768 is height, my-live-stream is id. */

  camera.live.on("frame", (buffer) => console.log(buffer));
  /* live property examples explained before. */
  ```

  Example 2# for `serveLive`:

  ```ts
  const stream = camera.serveLive(1280, 768, "my-live-stream", {
    fps: 25,
    codec: "h265",
  });
  /* fps explained before but codec is one of ICameraVideoOptoins item (is for codec of video or stream). */

  stream.stdout.on("data", (buffer) => console.log(buffer));
  /* second way of accessing stream, serveLive returns ChildProcessWithoutNullStreams value, soemthing like what exec or spawn (from node:child_process) returns.*/
  ```

### Stats

Some methods are responsible for **checking** and **troubleshooting** camera.
methods includes:

- #### `isReady`:

  Its a **Asynchronous method** for checking camera connection, checks by running a simple and void command on camera, if response, returns **true** , else, returns **false**.

  _note:_ no arguments should passed to this method.

- #### `isReadySync`:

  Its a **Synchronous method** of `isReady`.

  _note:_ no arguments should passed to this method.

- #### Examples for stats:

_note:_ You should evaluate `RPICam` constructor before use this examples, also we imagine `camera` variable is `RPICam` class with evaluated constructor.

Example for `isReady`:

```ts
camera.isReady().then((e) => console.log(e ? "its Ready" : "its not ready"));

// or

const ready = async () => {
  const isReady = await camera.isReady();
  return isReady;
};

// output type is Promise<boolean>.
```

Example for `isReadySync`:

```ts
console.log(camera.isReadySync() ? "its Ready" : "its not Ready");

// output type is boolean.
```

### Reservation

Some methods are responsible for reserving and releasing camera or just waiting for camera to release, all this actions happens just for avoiding **Race-condition** bug.

_note:_ **Race-condition** bug, is one of the hardest and the most impossible bugs you can achieve. at all race-condition bug means: two or more processes a races to **gaining access** to one thing (like **variables**, **hardware modules** and others...), at the end, one of them success to gaining access and others will **crash** or _working with disorder_.

methods includes:

- #### `killTask`:

  This is a **synchronous method** that terminates asynchronous video recording tasks belonging to its main process, based on their task ID. (It works based on Node.js's `process.kill`).

  This method takes these arguments:

  - `id` [ `string` ]: Id of asynchronous task created by asynchronous methods.
  - `force` [ `boolean` ]: force kill, fore means to send **SIGKILL** code but else sends **SIGINT** code, (difference betwen code 15 and 9).

- #### `killAllTasks`:

  This is similar to the `killTask` method, but instead of killing a single task, it **terminates all tasks**.

  _note:_ The only argument it accepts is `force`.

- #### `reserve`:

  This is a **synchronous method** that reserves the camera, preventing other processes (even external ones) from accessing it until it's released.

  It occupies the camera with a local process by running an infinite stream with null output, keeping it busy until released by that local process.

  You also need to manually release the camera before executing other methods that require camera access.

  _note:_ If you prefer **Automatic reservation** and release without manual control, you should set the `autoReserve` property to `true` in the `RPICam` constructor when creating an instance (explained in pasts).

- #### `unlockReserve`:

  This **Synchronous method** works in _reverse_ to the `reserve` method. It _terminates_ the infinite reservation process on the camera, releasing it from its occupied and reserved state.

  _note 1:_ If you're managing _reservations_ **Manually**, you must use this method to free the camera before running any other methods that require it, assuming it was previously reserved. If `autoReserve` is enabled, this isn't necessary, as it _automatically_ handles the release before any **camera-dependent** method runs.

  _note 2:_ Also, if you're managing manually, ensure the camera is reserved beforehand (you can check this with the `isReserved` method, which we'll cover later). After releasing the camera and executing your **camera-dependent method**, manually reserve it again. This manual re-reservation isn't needed if `autoReserve` is active.

- #### `isReserved`:

  This method checks whether the camera is reserved. It returns `true` if reserved and `false` otherwise.

  _note 1:_ this is **important** to check is _reserved_ or not, before running method like `reserve` and `unlockReserved`, if running without checking _reservation_, its imminent to fails (throwing **error**) and whole process crashes.

  _note 2:_ this methods, takes nothing as argument.

- #### `wait`:

  This **Asynchronous method** waits in a _loop_ for the camera to become available (_asynchronously_). It returns a result once the camera responds, if timeout reachs end, responds with `output: false` but `success` of output is always `true` (_return type_ of this method backs to [Types](#types) in [Return types](#return-types)) ,This method takes two arguments:

  - `timeout` [ `number` ]: The duration to wait (in _milliseconds_ ans its _optional_). If this time elapses, the waiting loop terminates. Its default value is `Infinity`.

  _note:_ You can also **force the wait to end** by setting the `waiting` property to `false`.

- #### `waitSync`:

  This method is the **Synchronous** version of `wait`, and it has no _difference_ in its arguments.

  _note:_ this method unlike method `wait`, `waiting` property does not affect on this method.

  ### Examples for reservation

  _note:_ You should evaluate `RPICam` constructor before use this examples, also we imagine `camera` variable is `RPICam` class with evaluated constructor.

  Example for `reserve` and `unlockReserve` methods:

  ```ts
  camera.reserve();

  // some stuffs
  if (camera.isReserved()) camera.unlockReserve();
  // if you are sure of is reserved, its not required to use isReserved method!

  camera
    .serveStill("myImage.jpg", 1280, 768, "my-image")
    .then(() => camera.reserve());
  ```

  Example for `wait` and `waitSync` methods:

  ```ts
  if (!camera.isReadySync()) waitSync(10000);
  // 10000 means timeout in ms.

  // --- async way ---

  const reservation = async () => {
    const isReady = await camera.isReady();
    if (!isReady) await camera.wait();
    // no argument means: no limit!
  };
  setInterval(() => {
    const date = new Date();
    if (date.getDay() == 0) camera.waiting = false; // cancelling waiting process.
  });

  reservation();
  ```
