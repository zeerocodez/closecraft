import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || process.env.AUTH_SECRET || 'closecraft_default_meta_vault_secret_2026';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a sensitive string (such as an access token) using AES-256-GCM.
 */
export function encryptToken(plainText: string): string {
  if (!plainText) return plainText;
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    return `enc:${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error('[MetaCrypto] Encryption error, fallback to raw string:', err);
    return plainText;
  }
}

/**
 * Decrypts an encrypted token string. If not prefixed with 'enc:', returns plainText.
 */
export function decryptToken(cipherText: string): string {
  if (!cipherText || !cipherText.startsWith('enc:')) {
    return cipherText;
  }
  
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 4) return cipherText;
    
    const [, ivHex, authTagHex, encryptedData] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[MetaCrypto] Decryption error:', err);
    return cipherText;
  }
}

export const encryptCredential = encryptToken;
export const decryptCredential = decryptToken;
