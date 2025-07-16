import { Request, Response } from 'express';
import { generateChallenge, verifyProof } from '@services/authService';
import * as userService from '@services/userService';
import { Address } from '@ton/core';

export const postChallenge = async (req: Request, res: Response) => {
  // Address is no longer required for generating a challenge.
  // The backend generates a generic payload for any wallet to sign.
  const challenge = await generateChallenge();
  // Можно сохранить challenge в БД или in-memory (например, Redis) для последующей проверки
  res.json(challenge);
};

export const postVerify = async (req: Request, res: Response) => {
  const { address: rawAddress, proof, publicKey } = req.body;
  
  if (!rawAddress || !proof || !publicKey) {
    return res.status(400).json({ error: 'Required fields are missing: address, proof, publicKey' });
  }

  const isValid = await verifyProof({ address: rawAddress, proof, publicKey });
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature or expired challenge' });
  }

  const userFriendlyAddress = Address.parse(rawAddress).toString({ bounceable: false });

  let user = await userService.getUserByAddress(userFriendlyAddress);
  if (!user) {
    user = await userService.createUser(userFriendlyAddress);
  }

  // TODO: Issue JWT or session
  res.json({ success: true, user });
}; 