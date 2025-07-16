export type * from "./camera";
export interface IOutputException {
  success: boolean;
  error?: {
    readable: string;
    name: string;
  };
  output?: any;
}
