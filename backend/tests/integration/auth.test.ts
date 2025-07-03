import request from 'supertest';
import { describe, it, expect, jest, beforeAll, afterEach } from '@jest/globals';
import app from '../../src/app';
import * as authService from '../../src/services/authService';
import * as userService from '../../src/services/userService';
import { Address } from '@ton/core';

// Mock the services
jest.mock('../../src/services/authService');
jest.mock('../../src/services/userService');
jest.mock('@ton/core');

const mockedAuthService = authService as jest.Mocked<typeof authService>;
const mockedUserService = userService as jest.Mocked<typeof userService>;
const mockedAddress = Address as jest.Mocked<typeof Address>;

describe('Auth Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/challenge', () => {
    it('should get a valid challenge payload', async () => {
      const challengePayload = {
        payload: 'some-random-payload-string',
      };
      mockedAuthService.generateChallenge.mockResolvedValue(challengePayload);

      const response = await request(app).post('/api/auth/challenge').send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual(challengePayload);
      expect(mockedAuthService.generateChallenge).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/verify', () => {
    const mockProof = {
      address: '0:d31481c47a3e7638f6f879467c0ff99f53e167272186794878f56134b2868448',
      proof: {
        timestamp: Date.now(),
        domain: {
          lengthBytes: 21,
          value: 'ton-connect-test-dapp',
        },
        payload: 'some-random-payload-string',
        signature: 'some-signature',
      },
      publicKey: 'some-public-key',
    };

    const userFriendlyAddress = 'UQDXFІн+Zjj2+HlGfA/5n1T4WnJgG5IeJNbI4aI4gBJQ';

    beforeAll(() => {
      // Mock the Address parser to return a predictable user-friendly address
      mockedAddress.parse.mockReturnValue({
        toString: () => userFriendlyAddress,
      } as any);
    });

    afterEach(() => {
      // Clear all mock history after each test
      jest.clearAllMocks();
    });

    it('should fail if required fields are missing', async () => {
      const response = await request(app).post('/api/auth/verify').send({
        address: mockProof.address,
        // Missing proof and publicKey
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Required fields are missing: address, proof, publicKey');
    });

    it('should fail if signature is invalid', async () => {
      mockedAuthService.verifyProof.mockResolvedValue(false);

      const response = await request(app).post('/api/auth/verify').send(mockProof);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid signature or expired challenge');
      expect(mockedAuthService.verifyProof).toHaveBeenCalledWith(mockProof);
    });

    it('should succeed and create a new user if user does not exist', async () => {
      mockedAuthService.verifyProof.mockResolvedValue(true);
      mockedUserService.getUserByAddress.mockResolvedValue(null);
      const newUser = { id: '1', address: userFriendlyAddress, createdAt: new Date() };
      mockedUserService.createUser.mockResolvedValue(newUser);

      const response = await request(app).post('/api/auth/verify').send(mockProof);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual({
        ...newUser,
        createdAt: newUser.createdAt.toISOString(),
      });

      expect(mockedAddress.parse).toHaveBeenCalledWith(mockProof.address);
      expect(mockedUserService.getUserByAddress).toHaveBeenCalledWith(userFriendlyAddress);
      expect(mockedUserService.createUser).toHaveBeenCalledWith(userFriendlyAddress);
    });

    it('should succeed and return an existing user', async () => {
      const existingUser = { id: '2', address: userFriendlyAddress, createdAt: new Date() };
      mockedAuthService.verifyProof.mockResolvedValue(true);
      mockedUserService.getUserByAddress.mockResolvedValue(existingUser);

      const response = await request(app).post('/api/auth/verify').send(mockProof);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual({
        ...existingUser,
        createdAt: existingUser.createdAt.toISOString(),
      });

      expect(mockedUserService.getUserByAddress).toHaveBeenCalledWith(userFriendlyAddress);
      expect(mockedUserService.createUser).not.toHaveBeenCalled();
    });
  });
}); 