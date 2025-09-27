export type * from "./camera.js";

export interface IOutputException {
  success: boolean;
  error?: {
    readable: string;
    name: string;
  };
  output?: any;
}
