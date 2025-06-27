import { setUser } from "src/config";

export function handlerLogin(cmdName: string, ...args: string[]): void {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const userName = args[0];
  setUser(userName);
  console.log(`user ${userName} has been set`);
}

