import { Request, Response } from 'express';
import { generateChallenge, verifyProof } from '@services/authService';
import * as userService from '@services/userService';

export const postChallenge = async (req: Request, res: Response) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'address обязателен' });
  const challenge = await generateChallenge(address);
  // Можно сохранить challenge в БД или in-memory (например, Redis) для последующей проверки
  res.json(challenge);
};

export const postVerify = async (req: Request, res: Response) => {
  const { address, payload, signature, domain, timestamp, publicKey } = req.body;
  if (!address || !payload || !signature || !domain || !timestamp || !publicKey) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }
  const isValid = await verifyProof({ address, payload, signature, domain, timestamp, publicKey });
  if (!isValid) return res.status(401).json({ error: 'Неверная подпись или истёкший challenge' });

  // Найти или создать пользователя
  let user = await userService.getUserByAddress(address);
  if (!user) user = await userService.createUser(address);

  // TODO: выдать JWT или сессию
  res.json({ success: true, user });
}; 