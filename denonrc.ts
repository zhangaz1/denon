import { exists, readFileStr } from "https://deno.land/std/fs/mod.ts";
import { fail, debug } from "./log.ts";

export interface DenonConfig {
  files: string[];
  quiet: boolean;
  debug: boolean;
  fullscreen: boolean;
  extensions: string[] | undefined;
  match: string[] | undefined;
  skip: string[] | undefined;
  interval: number;
  watch: string[];
  permissions: string[];
  execute: { [extension: string]: string[] };
}

export const DenonConfigDefaults: DenonConfig = {
  files: [],
  quiet: false,
  debug: false,
  fullscreen: false,
  extensions: undefined,
  match: undefined,
  skip: undefined,
  interval: 500,
  watch: [],
  permissions: [],
  execute: {
    ".js": ["deno", "run"],
    ".ts": ["deno", "run"],
  },
};

export async function readConfig(file?: string): Promise<DenonConfig> {
  if (file && !(await exists(file))) {
    fail(`Could not find ${file}`);
  }

  if (!file) {
    if (await exists(".denonrc")) {
      file = ".denonrc";
    }

    if (await exists(".denonrc.json")) {
      file = ".denonrc.json";
    }
  }

  let json = {} as any;

  if (file) {
    json = JSON.parse(await readFileStr(file));
  }

  if (json.permissions) {
    json.permissions = json.permissions.map((p: string) =>
      p.startsWith("--allow-") ? p : `--allow-${p}`
    );
  }

  return { ...DenonConfigDefaults, ...json };
}
