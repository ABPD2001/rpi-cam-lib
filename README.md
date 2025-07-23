# Raspberry pi camera library for node.js

A **simple** and **lightweight** library to control the _Raspberry Pi Camera_ with Node (JS/TS).

## Table of contents

- [Table of contents](#table-of-contents)
- [Introduction](#introduction)
- [Installation](#installation)
- [Features](#features)
- [Technicals](#technicals)
- [License](#license)
- [Contact us](#contact-us)

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

_Technical things documentioned in [docs/technichals.md](https://github.com/abpd2001/rpi-cam-lib/docs/technichals.md)._

## License

```
MIT License

Copyright (c) 2025 abpd2001: Abolfazl pouretemadi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Contact Us

You can help us, _report_ bugs and recommend _features_ to us via **email**, `a.p.i.2001.company@gmail.com`.

---

by `@ABPD2001` in github -> `@abpd2001` in npm.

thanks `@fmohtadi99` for helps.
[Check Github Page](https://github.com/ABPD2001/)
