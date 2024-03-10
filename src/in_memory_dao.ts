import { AppAttestKey, Dao } from './dao';

export class InMemoryDao implements Dao {
  private readonly attestationNonces: Record<string, string> = {};
  private readonly appAttestKeys: Record<string, AppAttestKey> = {};

  async putAttestationNonce(
    clientId: string,
    requestId: string,
    nonce: string,
  ): Promise<void> {
    this.attestationNonces[this.getNonceKey(clientId, requestId)] = nonce;
  }

  async getAttestationNonce(
    clientId: string,
    requestId: string,
  ): Promise<string | null> {
    return (
      this.attestationNonces[this.getNonceKey(clientId, requestId)] ?? null
    );
  }

  async putAppAttestKey(
    clientId: string,
    publicKeyPem: string,
    receipt: Buffer,
    attestCount: number,
  ): Promise<void> {
    const key: AppAttestKey = { publicKeyPem, receipt, attestCount };
    this.appAttestKeys[clientId] = key;
  }

  async getAppAttestKey(clientId: string): Promise<AppAttestKey | null> {
    return this.appAttestKeys[clientId] ?? null;
  }

  private getNonceKey(clientId: string, requestId: string): string {
    return `${clientId}:${requestId}`;
  }
}
