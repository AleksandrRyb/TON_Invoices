import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import { PrismaClient } from '../../src/generated/prisma';
import Redis from 'ioredis';
import { keyPairFromSeed, sign, getSecureRandomBytes } from '@ton/crypto';
import app from '../../src/app';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL as string);

describe('Auth Endpoints', () => {
  // Clean up the database and redis after each test
  afterEach(async () => {
    await prisma.invoice.deleteMany();
    await prisma.user.deleteMany();
    await redis.flushall();
  });

  // Disconnect clients after all tests are done
  afterAll(async () => {
    await prisma.$disconnect();
    await redis.disconnect();
  });

  it('should get a valid challenge from POST /api/auth/challenge', async () => {
    const response = await request(app)
      .post('/api/auth/challenge')
      .send({ address: 'EQCD39VS5jcpt_R-c14D6S1m2lUeP1hP1c2KqS-d_IeKAAAA' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('payload');
    expect(response.body).toHaveProperty('domain');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body.address).toBe('EQCD39VS5jcpt_R-c14D6S1m2lUeP1hP1c2KqS-d_IeKAAAA');
  });

  it('should successfully verify a valid proof and create a new user', async () => {
    // 1. Generate a key pair for the test
    const seed = await getSecureRandomBytes(32);
    const keyPair = keyPairFromSeed(seed);
    const testAddress = 'EQBYA_g-9Yj2-eHlGfA_Z3-UPzfs4WnJgG5IeJNbI4aISL4s';

    // 2. Get a challenge
    const challengeRes = await request(app)
      .post('/api/auth/challenge')
      .send({ address: testAddress });

    expect(challengeRes.status).toBe(200);
    const { payload, domain, timestamp } = challengeRes.body;

    // 3. Sign the payload
    const signature = sign(Buffer.from(payload, 'hex'), keyPair.secretKey);

    // 4. Send for verification
    const verifyRes = await request(app)
      .post('/api/auth/verify')
      .send({
        address: testAddress,
        payload,
        domain,
        timestamp,
        signature: signature.toString('hex'),
        publicKey: keyPair.publicKey.toString('hex'),
      });

    // 5. Assert the response
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.user.address).toBe(testAddress);

    // 6. Assert database state
    const userInDb = await prisma.user.findUnique({ where: { address: testAddress } });
    expect(userInDb).not.toBeNull();
    expect(userInDb?.address).toBe(testAddress);

    // 7. Assert Redis state (challenge should be deleted)
    const challengeInRedis = await redis.get(`challenge:${testAddress}`);
    expect(challengeInRedis).toBeNull();
  });

  it('should fail verification with an invalid signature', async () => {
    const testAddress = 'EQBYA_g-9Yj2-eHlGfA_Z3-UPzfs4WnJgG5IeJNbI4aISL4s';
    
    // Get a challenge
    const challengeRes = await request(app)
      .post('/api/auth/challenge')
      .send({ address: testAddress });
    const { payload, domain, timestamp } = challengeRes.body;

    // Send for verification with a bogus signature and public key
    const verifyRes = await request(app)
      .post('/api/auth/verify')
      .send({
        address: testAddress,
        payload,
        domain,
        timestamp,
        signature: 'bogus_signature',
        publicKey: 'bogus_public_key',
      });

    expect(verifyRes.status).toBe(401);
    expect(verifyRes.body.error).toBe('Неверная подпись или истёкший challenge');
  });

  it('should prevent replay attacks by failing on second verification', async () => {
    // --- First, do a successful verification (same as the happy path test) ---
    const seed = await getSecureRandomBytes(32);
    const keyPair = keyPairFromSeed(seed);
    const testAddress = 'EQBYA_g-9Yj2-eHlGfA_Z3-UPzfs4WnJgG5IeJNbI4aISL4s';
    
    const challengeRes = await request(app)
      .post('/api/auth/challenge')
      .send({ address: testAddress });
    const { payload, domain, timestamp } = challengeRes.body;
    const signature = sign(Buffer.from(payload, 'hex'), keyPair.secretKey);

    const firstVerifyRes = await request(app)
      .post('/api/auth/verify')
      .send({
        address: testAddress, payload, domain, timestamp,
        signature: signature.toString('hex'),
        publicKey: keyPair.publicKey.toString('hex'),
      });
    expect(firstVerifyRes.status).toBe(200); // Verify it worked the first time

    // --- Second, attempt to use the same proof again ---
    const secondVerifyRes = await request(app)
      .post('/api/auth/verify')
      .send({
        address: testAddress, payload, domain, timestamp,
        signature: signature.toString('hex'),
        publicKey: keyPair.publicKey.toString('hex'),
      });
    
    // Assert it fails because the challenge was deleted from Redis
    expect(secondVerifyRes.status).toBe(401);
    expect(secondVerifyRes.body.error).toBe('Неверная подпись или истёкший challenge');
  });
}); 