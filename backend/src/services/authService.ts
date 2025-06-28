import { getSecureRandomBytes } from '@ton/crypto';
import { signVerify } from '@ton/crypto';
import Redis from 'ioredis';
import { env } from '@config/env';

const redis = new Redis(env.REDIS_URL);
const CHALLENGE_TTL = 5 * 60; // 5 минут в секундах

export async function generateChallenge(address: string) {
  // Генерируем случайный payload (например, 32 байта)
  const payload = (await getSecureRandomBytes(32)).toString('hex');
  // Можно добавить timestamp и домен для защиты от replay-атак
  const challenge = {
    address,
    payload,
    domain: 'whale.local',
    timestamp: Date.now(),
  };
  // Сохраняем challenge в Redis с TTL
  await redis.set(`challenge:${address}`, JSON.stringify(challenge), 'EX', CHALLENGE_TTL);
  return challenge;
}

export async function verifyProof({
  address,
  payload,
  signature,
  domain,
  timestamp,
  publicKey,
}: {
  address: string;
  payload: string;
  signature: string;
  domain: string;
  timestamp: number;
  publicKey: string;
}) {
  // Получаем challenge из Redis
  const challengeRaw = await redis.get(`challenge:${address}`);
  if (!challengeRaw) return false;
  const challenge = JSON.parse(challengeRaw);
  // Проверяем, что payload, domain, timestamp совпадают
  if (
    challenge.payload !== payload ||
    challenge.domain !== domain ||
    challenge.timestamp !== timestamp
  ) return false;
  // Проверяем TTL (дополнительно)
  if (Date.now() - timestamp > CHALLENGE_TTL * 1000) return false;
  // Проверяем подпись (TON uses ed25519)
  // signature, payload, publicKey должны быть в hex    
  try {
    const isValid = signVerify(
      Buffer.from(payload, 'hex'),
      Buffer.from(signature, 'hex'),
      Buffer.from(publicKey, 'hex')
    );
    if (isValid) {
      // Challenge можно удалить, чтобы нельзя было использовать повторно
      await redis.del(`challenge:${address}`);
    }
    return isValid;
  } catch (e) {
    return false;
  }
} 