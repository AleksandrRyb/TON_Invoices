import { PrismaClient, Invoice } from '@generated/prisma';

const prisma = new PrismaClient();

export const getAllInvoices = async (): Promise<Invoice[]> => {
  return prisma.invoice.findMany({ include: { user: true } });
};

export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
  return prisma.invoice.findUnique({ where: { id }, include: { user: true } });
};

export const createInvoice = async (data: {
  amount: string;
  asset: string;
  status: string;
  userId: string;
  expiresAt?: Date;
  txHash?: string;
}): Promise<Invoice> => {
  return prisma.invoice.create({ data });
};

export const updateInvoiceStatus = async (id: string, status: string): Promise<Invoice> => {
  return prisma.invoice.update({ where: { id }, data: { status } });
};

export const deleteInvoice = async (id: string): Promise<Invoice> => {
  return prisma.invoice.delete({ where: { id } });
}; 