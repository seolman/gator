import { setUser } from "src/config";
import { createUser, getUserByName } from "src/db/queries/users";

export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const userName = args[0];

  const user = await getUserByName(userName);
  if (!user) {
    throw new Error(`user ${userName} does not exist`);
  }

  setUser(userName);
  console.log(`user ${userName} has been set`);
}

export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const userName = args[0];

  const user = await createUser(userName);
  if (!user) {
    throw new Error(`user ${userName} not found`);
  }
  setUser(userName);
  console.log(`user created: ${userName}`);
  console.log(user);
}
