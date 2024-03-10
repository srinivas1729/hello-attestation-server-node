import { DotenvConfigOutput } from 'dotenv';

export function ensureConfigSuccess(output: DotenvConfigOutput) {
  if (output.error) {
    console.error(`Error in dotEnvConfig: ${output.error}`);
    process.exit(1);
  }
}

export function getEnvValue(
  key: string,
  defaultValue: number | string,
): number | string {
  const valueStr = process.env[key];
  if (!valueStr) {
    return defaultValue;
  }
  if (typeof defaultValue === 'string') {
    return valueStr;
  }
  const numValue = parseInt(valueStr, 10);
  if (Number.isNaN(numValue)) {
    console.error(`Could not parse env var: '${valueStr}'`);
    process.exit(1);
  }
  return numValue;
}

export function parseUUIDV4(uuid: string): Buffer {
  return Buffer.from(uuid.split('-').join(''), 'hex');
}
