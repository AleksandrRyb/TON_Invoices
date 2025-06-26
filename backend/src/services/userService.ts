import { PrismaClient, User } from '@generated/prisma';

const prisma = new PrismaClient();

export const getAllUsers = async (): Promise<User[]> => {
  return prisma.user.findMany({ include: { invoices: true } });
};

export const getUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { id }, include: { invoices: true } });
};

export const createUser = async (address: string): Promise<User> => {
  return prisma.user.create({ data: { address } });
};

export const deleteUser = async (id: string): Promise<User> => {
  return prisma.user.delete({ where: { id } });
};

export const getUserByAddress = async (address: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { address }, include: { invoices: true } });
}; 