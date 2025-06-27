import path from "path";
import os from "os";
import fs from "fs";

type Config = {
  dbUrl: string;
  currentUserName: string;
};


export function setUser(userName: string) {
  const config = readConfig();
  config.currentUserName = userName;
  writeConfig(config);
}

export function readConfig(): Config {
  const fullPath = getConfigFilePath();
  const data = fs.readFileSync(fullPath, {
    encoding: "utf-8"
  });
  const rawConfig = JSON.parse(data);

  if (!rawConfig.db_url || typeof rawConfig.db_url !== "string") {
    throw new Error("db_url is required in config file");
  }
  if (
    !rawConfig.current_user_name ||
    typeof rawConfig.current_user_name !== "string"
  ) {
    throw new Error("current_user_name is required in config file");
  }

  return {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name
  };
}

function writeConfig(config: Config) {
  const fullPath = getConfigFilePath();

  const rawConfig = {
    db_url: config.dbUrl,
    current_user_name: config.currentUserName,
  };

  fs.writeFileSync(fullPath, JSON.stringify(rawConfig, null, 2), {
    encoding: "utf-8",
  });
}

function getConfigFilePath(): string {
  const configFileName = ".gatorconfig.json";
  const homeDir = os.homedir();
  const fullPath = path.join(homeDir, configFileName);
  return fullPath;
}

