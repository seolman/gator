import { CommandsRegistry, middlewareLoggedIn, registerCommand, runCommand } from "./commands/command";
import { handlerAddFeed, handlerAgg, handlerBrowse, handlerFeeds, handlerFollow, handlerFollowing, handlerUnfollow } from "./commands/rss";
import { handlerLogin, handlerRegister, handlerReset, handlerUsers } from "./commands/users";

async function main() {
  const rawArgs = process.argv.slice(2);
  if (rawArgs.length < 1) {
    console.error("not enough arguments");
    process.exit(1);
  }

  const [cmdName, ...cmdArgs] = rawArgs;
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister);
  registerCommand(registry, "reset", handlerReset);
  registerCommand(registry, "users", handlerUsers);
  registerCommand(registry, "agg", handlerAgg);
  registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
  registerCommand(registry, "feeds", handlerFeeds);
  registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
  registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));
  registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));
  registerCommand(registry, "browse", middlewareLoggedIn(handlerBrowse));


  try {
    await runCommand(registry, cmdName, ...cmdArgs);
  } catch (err) {
    console.error(`${(err as Error).message}`);
    process.exit(1);
  }

  process.exit(0);
}

main();
