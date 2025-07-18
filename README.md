# Raspberry pi camera library for node.js

A **simple** and **lightweight** library to control the _Raspberry Pi Camera_ with Node (JS/TS).

## Table of contents

- [Table of contents](#table-of-contents)
- [Introduction](#introduction)
- [Installation](#installation)
- [Features](#features)
- [Technicals](#technicals)
  - [Types](#types)
  - [Properties](#properties)
    - [`tasks`](#tasks)
    - [`live`](#live)
  - [Serves](#serves)
    - [`serveStill`](#servestill)
    - [`serveStillSync`](#servestillsync)
    - [`serveStillCustom`](#servestillcustom)
    - [`serveStillCustomSync`](#servestillcustomsync)
    - [`serveVideo`](#servevideo)
    - [`serveVideoSync`](#servevideosync)
    - [`serveVideoCustom`](#servevideocustom)
    - [`serveVideoCustomSync`](#servevideocustomsync)
  - [Streams](#streams)
    - [`serveLive`](#servelive)
  - [Stats](#stats)
    - [`isReady`](#isready)
    - [`isReadySync`](#isreadysync)
  - [Reservations](#reservations)
    - [`killTask`](#killtask)
    - [`killAllTasks`](#killalltasks)
    - [`reserve`](#reserve)
    - [`unlockReserve`](#unlockreserve)

## Introduction

`rpicam-apps-lite` is a linux package `rpi-cam` npm library dependent to it and used for controlling _Raspberry Pi Camera_ series connects via CSI-2 socket and other ports.

**Warning:** This library only test on these Linux distros and not recommended to use windows or other OS not supported for `rpicam-apps-lite` package, also is not fast as a C/C++ custom drivers and use shell tools!

- Debian
- Ubuntu
- Raspbian

## Installation

First you need to setup dependent packages, so run this command to check already installed or not:

```bash
apt list --installed rpicam-apps-lite  # for Debian based distros.
# or
yum list --installed rpicam-apps-lite  # for REHL based distros (not recommended).
```

_Note: if already downloaded, skip downloading, else continue._

then download package by this command:

```bash
sudo apt install rpicam-apps-lite  # for Debian based distros.
# or
sudo yum install rpicam-apps-lite  # for REHL based distros (not recommended).
```

at last, install library on your node.js project:

```bash
npm install rpi-cam-lib
```

## Features

Is lightweight, user friendly and professionals also can use this as a advanced library access them to every options like **zooming** or adding **effects** and **capturing method** and mores supported in `rpicam-apps-lite`.

Some advatage of using this library:

- its user-friendly and has advanced tools for professionals.
- its lightweight.
- all tools in `rpicam-apps-lite` is usable on this library.
- can wait and reserve camera to avoid **race-condition** bugs.
- also can do advanced method of capturing videos and photos like _burst shots_, _capturing last 30 minutes_ or _live streaming_ and others...

## Technicals

_Technical things documentioned in this section._

The `RPIClass` is the main class for using the Raspberry Pi camera. This class has a constructor that takes two arguments:

1. **Camera Index** [ `number` ]: Selects which camera to use.

2. **Options** [ `{autoReserve?: boolean}` ]: Currently, there is only one property in this argument called `autoReservation`, which automatically reserves and releases the camera.

### Types

dfgfdgdfgdflgmldfkgmldfkgmlkdfgm

### Properties

`RPICam` class includes two property:

- `tasks` [ `{pid: number, id: string} []` ]: current running _async_ tasks for managing them with `killTask` or `killAllTasks` or manage it directly by _process id_.

- `live`: [ extends `EventEmitter` ]: When you start a live stream with the `serveLive` method, it provides output in two ways:

  - The **first output** is in the return value, which is a process type, or more specifically, a `ChildProcessWithoutNullStreams`.

  - The **second output** is available in a property called `live`. This property, via an `EventEmitter`, provides each live frame as a buffer using events.

  - Whenever the live stream starts, the **`started`** event occurs.
  - Whenever a frame is received, the **`frame`** event occurs.
    And whenever the stream is disconnected, the **`closed`** event occurs.

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

_note: options type is `ICameraStillOptions & {stream?: boolean, output?: string, format?: string}`._

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
