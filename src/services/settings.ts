import * as path from 'path';
import fsDirect from 'fs';
import { MiroSettings } from '@/core/types';
import { promises as fs } from 'fs';
import * as YAML from 'yaml';

const MIROCLI_FOLDER_NAME = '.miro';
const SETTINGS_FILE_NAME = 'settings.yaml';
const CONFIG_FILE_NAME = 'config.yaml';
const SETTINGS_PATH = path.join(process.env.HOME || '', MIROCLI_FOLDER_NAME, SETTINGS_FILE_NAME);
const DEFAULT_CLI_PORT = 3000;
const CONFIG_PATH = path.join(process.env.HOME || '', MIROCLI_FOLDER_NAME, CONFIG_FILE_NAME);

async function loadSettings(): Promise<MiroSettings | null> {

  if(!fsDirect.existsSync(SETTINGS_PATH)){
    return null
  }

  try {
    const file = await fs.readFile(SETTINGS_PATH, 'utf8');
    return (YAML.parse(file) as MiroSettings);
  } catch (error) {
    return null;
  }
}

const stg = await loadSettings()

export function getConfigPath(): string{
    return CONFIG_PATH;
}

export const settings: MiroSettings = {
    cliPort: stg?.cliPort ?? DEFAULT_CLI_PORT,
    envs: stg?.envs ?? [],
}