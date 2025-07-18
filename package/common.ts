import { kill } from "node:process";
import type { IOutputException } from "./interfaces/index";

interface ITASKMANItem {
  pid: number;
  id: string;
}

export class Taskman {
  public tasks: ITASKMANItem[] = [];

  /**
   * Kills a async task opreation of camera.
   * @param {string} id is a custom id to call it everywhere and should be unique or get a error.
   * @param {boolean} force to kill a task or not, forcing sends a SIGKILL code to a task but, else sends a SIGTERM code to process.
   * @returns {IOutputException} status of killing a process, if id not exists, returns a error response, but else, throw a error.
   */

  killTask(id: string, force: boolean = true): IOutputException {
    if (this.tasks.some((e) => e.id == id)) {
      try {
        kill(this.tasks.find((e) => e.id == id)!.pid, force ? 9 : 15);
        return { success: true };
      } catch (err) {
        throw err;
      }
    }
    return {
      success: false,
      error: { readable: "id not exists in tasks!", name: "BAD_ID" },
    };
  }
  /**
   *
   * @ * @param {boolean} force to kill a task or not, forcing sends a SIGKILL code to a task but, else sends a SIGTERM code to processes.
   * @returns {IOutputException} status of killing all process, if error detected, throw a error.
   */

  killAllTasks(force?: boolean): IOutputException {
    try {
      this.tasks.map((e) => kill(e.pid, force ? 9 : 15));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: {
          readable: `An error detected while trying to kill all tasks!\nerr: ${err}`,
          name: "KILLING_ALL_ID_ERROR",
        },
      };
    }
  }
}
