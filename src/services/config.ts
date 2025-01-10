import { MiroConfig } from '@/core/types';
import { promises as fs } from 'fs';
import path from 'path';
import * as YAML from 'yaml';
import { getConfigPath } from './settings';

export async function loadConfig(): Promise<MiroConfig | null> {
  try {
    const file = await fs.readFile(getConfigPath(), 'utf8');
    return YAML.parse(file) as MiroConfig;
  } catch (error) {
    return null;
  }
}

export async function saveConfig(apps: MiroConfig): Promise<void> {
  const dir = path.dirname(getConfigPath());
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(getConfigPath(), YAML.stringify(apps), 'utf8');
}