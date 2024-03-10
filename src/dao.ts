export interface AppAttestKey {
  publicKeyPem: string;
  receipt: Buffer;
  attestCount: number;
}

export interface Dao {
  putAttestationNonce(
    clientId: string,
    requestId: string,
    nonce: string,
  ): Promise<void>;
  getAttestationNonce(
    clientId: string,
    requestId: string,
  ): Promise<string | null>;

  putAppAttestKey(
    clientId: string,
    publicKeyPem: string,
    receipt: Buffer,
    attestCount: number,
  ): Promise<void>;

  getAppAttestKey(clientId: string): Promise<AppAttestKey | null>;
}

let appDao: Dao | null = null;

export function setAppDao(dao: Dao) {
  appDao = dao;
}

export function getAppDao(): Dao {
  if (appDao === null) {
    throw new Error('appDao not set!');
  }
  return appDao;
}
