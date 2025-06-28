import { PrismaClient, Invoice } from '@generated/prisma';
import { InvoiceStatus } from '@constants/invoice';
import { Asset } from '@constants/asset';

const prisma = new PrismaClient();

export const getAllInvoices = async (): Promise<Invoice[]> => {
  return prisma.invoice.findMany({ include: { user: true } });
};

export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
  return prisma.invoice.findUnique({ where: { id }, include: { user: true } });
};

export const createInvoice = async (data: {
  amount: string;
  userId: string;
  expiresAt?: Date;
}): Promise<Invoice> => {
  return prisma.invoice.create({
    data: {
      amount: data.amount,
      userId: data.userId,
      expiresAt: data.expiresAt,
      asset: Asset.TON,
      status: InvoiceStatus.PENDING,
    },
  });
};

export const updateInvoiceStatus = async (id: string, status: InvoiceStatus): Promise<Invoice> => {
  return prisma.invoice.update({ where: { id }, data: { status } });
};

export const deleteInvoice = async (id: string): Promise<Invoice> => {
  return prisma.invoice.delete({ where: { id } });
}; 