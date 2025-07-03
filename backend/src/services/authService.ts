import { getSecureRandomBytes, signVerify } from '@ton/crypto';
import { Cell, contractAddress } from '@ton/core';
import Redis from 'ioredis';
import { env } from '@config/env';
import { sha256 } from 'js-sha256';

const redis = new Redis(env.REDIS_URL);
const CHALLENGE_TTL = 5 * 60; // 5 минут в секундах

export async function generateChallenge() {
  const payload = (await getSecureRandomBytes(32)).toString('hex');
  const challenge = { payload };
  await redis.set(`challenge:${payload}`, JSON.stringify(challenge), 'EX', CHALLENGE_TTL); 
  return challenge;
}

function createMessage(address: string, proof: any) {
  const addressParts = address.split(':');
  const workchain = parseInt(addressParts[0]);
  const addressHash = Buffer.from(addressParts[1], 'hex');

  const workchainBuffer = Buffer.alloc(4);
  workchainBuffer.writeInt32BE(workchain, 0); // Big-endian for workchain

  const domainLengthBuffer = Buffer.alloc(4);
  domainLengthBuffer.writeUInt32LE(proof.domain.lengthBytes, 0); // Little-endian for domain length

  const timestampBuffer = Buffer.alloc(8);
  timestampBuffer.writeBigUInt64LE(BigInt(proof.timestamp), 0); // Little-endian for timestamp

  const message = Buffer.concat([
    Buffer.from('ton-proof-item-v2/'),
    workchainBuffer,
    addressHash,
    domainLengthBuffer,
    Buffer.from(proof.domain.value),
    timestampBuffer,
    Buffer.from(proof.payload),
  ]);

  const messageHash = Buffer.from(sha256.create().update(message).digest());
  
  const fullMessage = Buffer.concat([
    Buffer.from([0xff, 0xff]),
    Buffer.from('ton-connect'),
    messageHash,
  ]);
  
  return Buffer.from(sha256.create().update(fullMessage).digest());
}

export async function verifyProof({
  address,
  proof,
  publicKey
}: {
  address: string;
  proof: {
    timestamp: number;
    domain: {
      lengthBytes: number;
      value: string;
    };
    payload: string;
    signature: string;
  };
  publicKey: string;
}) {
  const challengeRaw = await redis.get(`challenge:${proof.payload}`);
  if (!challengeRaw) {
    console.error('Challenge not found or expired');
    return false;
  }
  await redis.del(`challenge:${proof.payload}`);

  const message = createMessage(address, proof);
  const signature = Buffer.from(proof.signature, 'base64');
  const pubKey = Buffer.from(publicKey, 'hex');

  return signVerify(message, signature, pubKey);
} 