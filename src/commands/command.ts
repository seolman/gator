import { readConfig } from "src/config";
import { getUserByName } from "src/db/queries/users";
import type { User } from "src/db/schema";

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
type UserCommandHandler = (cmdName: string, user: User, ...args: string[]) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
  registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
  const handler: CommandHandler = registry[cmdName];
  if (!handler) {
    throw new Error(`unknown command: ${cmdName}`);
  }
  await handler(cmdName, ...args);
}

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
  return async function (cmdName: string, ...args: string[]) {
    const config = readConfig();
    const userName = config.currentUserName;

    if (!userName) {
      throw new Error("no user logged in");
    }

    const user = await getUserByName(userName);
    if (!user) {
      throw new Error(`user ${userName} not found`);
    }

    return handler(cmdName, user, ...args);
  };
}
