export type * from "./camera";
export type * from "./tinyCache";
export interface IOutputException {
  success: boolean;
  error?: {
    readable: string;
    name: string;
  };
  output?: any;
}
