import { Request, Response } from 'express';
import * as userService from '@services/userService';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении пользователей' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении пользователя' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: 'address обязателен' });
    const user = await userService.createUser(address);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании пользователя' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении пользователя' });
  }
}; 