import type { Stats } from "node:fs";

export interface ITinyCacheItem {
  name: string;
  stats: Stats;
  id: string;
  path: string;
}

export interface ITinyCacheOptions {
  compressLevel?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  compressCommand?: string;
  decompressCommand?: string;
  capicityBytesLimit?: number;
}
