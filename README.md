# Raspberry pi camera library for node.js

**Simple** and **lightweight** library for taking control of _Raspberry Pi Camera_ but dependent to `rpicam-apps-lite` linux package.

## Quick Start

- [Introduction](#introduction)
- [Installation]()

## Introduction

`rpicam-apps-lite` is a linux package `rpi-cam` npm library dependent to it and used for controlling _Raspberry Pi Camera_ series connects via CSI-2 socket and other ports.

<span style="color:#E9D502;"> **Warning:** </span>This library only test on these Linux distros and not recommended to use windows or other OS not supported for `rpicam-apps-lite` package!

- Debian
- Ubuntu
- Raspbian

## Installation

In first you need to setup dependent packages, so run this command to check already installed or not:

```bash
apt list --installed rpicam-apps-lite  # for Debian based distros.
yum list --installed rpicam-apps-lite  # for REHL based distros (not recommended).
```

_Note: if already downloaded, skip downloading, else continue._

then download it by this command:

```bash
sudo apt install rpicam-apps-lite  # for Debian based distros.
sudo yum install rpicam-apps-lite  # for REHL based distros (not recommended).
```

then install in your _node.js_ project with this command:

```bash
npm install rpi-cam
```

## APIs
