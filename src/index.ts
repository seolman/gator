import { CommandsRegistry, registerCommand, runCommand } from "./commands/commands";
import { handlerLogin } from "./commands/users";

function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);
  
  const rawArgs = process.argv.slice(2);

  if (rawArgs.length < 1) {
    console.error("not enough arguments");
    process.exit(1);
  }

  const [cmdName, ...args] = rawArgs;
  try {
    runCommand(registry, cmdName, ...args);
  } catch (err) {
    console.error(`${(err as Error).message}`);
    process.exit(1);
  }
}

main();
