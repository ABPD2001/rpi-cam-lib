# Raspberry pi camera library for node.js

**Simple** and **lightweight** library for taking control of _Raspberry Pi Camera_ but dependent to `rpicam-apps-lite` linux package.

## Table of contents

- [Table of contents](#table-of-contents)
- [Introduction](#introduction)
- [Installation](#installation)
- [Features](#features)

## Introduction

`rpicam-apps-lite` is a linux package `rpi-cam` npm library dependent to it and used for controlling _Raspberry Pi Camera_ series connects via CSI-2 socket and other ports.

**Warning:** This library only test on these Linux distros and not recommended to use windows or other OS not supported for `rpicam-apps-lite` package, also is not fast as a C/C++ custom drivers and use shell tools!

- Debian
- Ubuntu
- Raspbian

## Installation

In first you need to setup dependent packages, so run this command to check already installed or not:

```bash
apt list --installed rpicam-apps-lite  # for Debian based distros.
# or
yum list --installed rpicam-apps-lite  # for REHL based distros (not recommended).
```

_Note: if already downloaded, skip downloading, else continue._

then download it by this command:

```bash
sudo apt install rpicam-apps-lite  # for Debian based distros.
# or
sudo yum install rpicam-apps-lite  # for REHL based distros (not recommended).
```

then install in your _node.js_ project with this command:

```bash
npm install rpi-cam
```

## Features

Is lightweight, user friendly and professionals also can use this as a advanced library access them to every options like **zooming** or adding **effects** and **capturing method** and mores supported in `rpicam-apps-lite`.

Also this library has a _tiny tiny compressing cache_ powered by storage and is user-friendly but also professionals can create their own and use on `rpi-cam` library.

Some advatage of using this library:

- its user-friendly and has advanced tools for professionals.
- its lightweight.
- has tiny tiny cache already.
- all tools in `rpicam-apps-lite` is usable on this library.
- can wait and reserve camera to avoid **race-condition** bugs.
