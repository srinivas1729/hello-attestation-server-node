import { config as dotEnvConfig } from 'dotenv';

export interface Config {
  port: number;
  iosAppId: string;
  developmentEnv: boolean;
  supportTestApis: boolean;
}

// EK prefix => Env Key
const EK_PORT = 'PORT';
const EK_IOS_APP_ID = 'IOS_APP_ID';
const EK_DEVELOPMENT_ENV = 'DEVELOPMENT_ENV';
const EK_SUPPORT_TEST_APIS = 'SUPPORT_TEST_APIS';

const REQUIRED_KEYS = [EK_IOS_APP_ID, EK_DEVELOPMENT_ENV];

let config: Config | undefined;

export function getConfig(): Config {
  if (!config) {
    throw new Error('Config has not been initialized!');
  }
  return config;
}

export function initConfig(): void {
  const output = dotEnvConfig();
  if (output.error) {
    throw new Error(`Unable to parse config: ${output.error}`);
  }
  if (!output.parsed) {
    throw new Error('Missing parsed result!');
  }
  for (const k of REQUIRED_KEYS) {
    if (!(k in output.parsed)) {
      throw new Error(`Missing required env key: ${k}`);
    }
  }

  const port = parseNumber(output.parsed[EK_PORT] ?? '1729');
  const iosAppId = output.parsed[EK_IOS_APP_ID];
  const developmentEnv = parseBoolean(output.parsed[EK_DEVELOPMENT_ENV]);
  const supportTestApis = parseBoolean(
    output.parsed[EK_SUPPORT_TEST_APIS] ?? 'false',
  );
  config = {
    port,
    iosAppId,
    developmentEnv,
    supportTestApis,
  };
  console.log('Intialized config!');
}

function parseNumber(value: string): number {
  const numValue = parseInt(value, 10);
  if (Number.isNaN(numValue)) {
    throw new Error(`Could not parse env var: '${value}'`);
  }
  return numValue;
}

function parseBoolean(value: string): boolean {
  switch (value.toLowerCase()) {
    case 'false':
      return false;
    case 'true':
      return true;
    default:
      throw new Error(`Cannot convert to boolean value: ${value}`);
  }
}
