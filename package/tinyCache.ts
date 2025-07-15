import { rmSync, readdirSync, statSync, rm } from "node:fs";
import { exec, execSync } from "node:child_process";
import type { ITinyCacheOptions, ITinyCacheItem } from "./interfaces/index";
import { kill } from "node:process";
import { TASKMAN } from "./common";

export class TinyCache extends TASKMAN {
  private root: string;
  private options: ITinyCacheOptions = {};
  private items: ITinyCacheItem[] = [];

  constructor(root: string, options: ITinyCacheOptions) {
    super();
    this.root = root;
    this.options = options;
  }

  addItemSync(id: string, path: string) {
    const filename = path.split("/")[path.split("/").length - 1];

    const rootItems = readdirSync(this.root);
    if (rootItems.includes(filename))
      return {
        success: false,
        error: { name: "FILE_EXISTS", readable: "Already file exists" },
      };
    try {
      const compressing = execSync(
        this.options.compressCommand ||
          `gzip -${this.options.compressLevel || 5} -v ${path}`
      );
      const stats = statSync(path);
      if (
        this.options.capicityBytesLimit &&
        !(
          this.calculateTotalDisk() + stats.size >
          this.options.capicityBytesLimit
        )
      )
        this.items.push({
          id,
          name: filename,
          stats,
          path,
        });
      return { success: true, output: compressing.toString() };
    } catch (err) {
      return {
        success: false,
        error: {
          name: "INTERNAL_COMPRESS_ERROR",
          readable: `An internal error detected!\nerr: ${err}`,
        },
      };
    }
  }
  exportItemSync(id: string, path: string) {
    if (
      !readdirSync(this.root).includes(
        this.items.find((e) => e.id == id)!.name || ""
      )
    )
      return {
        success: false,
        error: { readable: "File does not exists!", name: "FILE_NOT_EXISTS" },
      };
    try {
      const decompress = execSync(
        this.options.decompressCommand || `gzip -v -d ${path}`
      );
      this.items = this.items.filter((e) => e.id != id);
      return { success: true, output: decompress.toString() };
    } catch (err) {
      return {
        success: false,
        error: {
          name: "INTERNAL_DECOMPRESS_ERROR",
          readable: `An internal error detected!\nerr: ${err}`,
        },
      };
    }
  }
  async exportItem(id: string) {
    if (
      !readdirSync(this.root).includes(
        this.items.find((e) => e.id == id)!.name || ""
      )
    )
      return {
        success: false,
        error: { readable: "File does not exists!", name: "FILE_NOT_EXISTS" },
      };
    const item = this.items.find((e) => e.id == id);

    return await new Promise((res, rej) => {
      const decompress_proc = exec(
        this.options.decompressCommand || `gzip -v -d ${item!.path}`,
        (err, output) => {
          if (err)
            rej({
              success: false,
              error: {
                readable: `An internal error in decompressing detected!\nerr: ${err}`,
                name: "INTERNAL_DECOMPRESS_ERROR",
              },
            });
          res({ output, success: true });
        }
      );
      this.tasks.push({ id, pid: decompress_proc.pid || -1 });
    });
  }
  async addItem(id: string, path: string) {
    const filename = path.split("/")[path.split("/").length - 1];

    const rootItems = readdirSync(this.root);
    if (rootItems.includes(filename))
      return {
        success: false,
        error: { name: "FILE_EXISTS", readable: "Already file exists" },
      };
    const stats = statSync(path);
    if (
      this.options.capicityBytesLimit &&
      !(
        this.calculateTotalDisk() + stats.size >
        this.options.capicityBytesLimit
      )
    )
      return await new Promise((res, rej) => {
        const compress_proc = exec(
          this.options.compressCommand ||
            `gzip -v -${this.options.compressLevel || 5} ${path}`,
          (err, output) => {
            if (err)
              rej({
                success: false,
                error: {
                  name: "INTERNAL_COMPRESS_ERROR",
                  readable: `An internal error in compressing detected!\nerr: ${err}`,
                },
              });
            res({ success: true, output });
          }
        );
        this.items.push({ id, name: filename, path, stats });
      });
  }

  clearCacheSync() {
    try {
      rmSync(`${this.root}/*`);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: {
          name: "CLEAR_CACHE_ERROR",
          readable: `An error in clearing cache detected!\nerr: ${err}`,
        },
      };
    }
  }
  async clearCache() {
    return await new Promise((res, rej) => {
      const { pid } = exec(`${this.root}/*`, (err) => {
        if (err)
          rej({
            success: false,
            error: {
              name: "CLEAR_CACHE_ERROR",
              readable: `An error in clearing cache detected!\nerr: ${err}`,
            },
          });
        res({ success: true });
      });
      this.tasks.push({ id: "Clear-Cache", pid: pid || -1 });
    });
  }

  calculateTotalDisk() {
    let output = 0;
    const files = readdirSync(this.root);
    files.forEach((e) => {
      output += statSync(`${this.root}/${e}`).size;
    });
    return output;
  }
}
