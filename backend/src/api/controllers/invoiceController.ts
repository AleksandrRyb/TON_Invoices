import { Request, Response } from 'express';
import * as invoiceService from '@services/invoiceService';
import * as userService from '@services/userService';
import { InvoiceStatus } from '@constants/invoice';
import { env } from '@config/env';

export const getAllInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await invoiceService.getAllInvoices();
    const formattedInvoices = invoices.map(invoice => ({
      ...invoice,
      amount: invoice.amount.toFixed(6),
    }));
    res.json(formattedInvoices);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении инвойсов' });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Инвойс не найден' });
    res.json({
      ...invoice,
      amount: invoice.amount.toFixed(6),
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении инвойса' });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  const { address, amount } = req.body;

  if (!address || !amount) {
    return res.status(400).json({ error: 'Поля address и amount обязательны' });
  }

  const user = await userService.getUserByAddress(address);
  if (!user) {
    return res.status(401).json({ error: 'Пользователь не найден. Сначала выполните аутентификацию.' });
  }

  try {
    const invoice = await invoiceService.createInvoice({ amount, userId: user.id });
    
    res.status(201).json({
      invoiceId: invoice.id,
      amount: invoice.amount.toFixed(6),
      recipientAddress: env.RECIPIENT_WALLET_ADDRESS,
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании инвойса' });
  }
};

export const updateInvoiceStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    // Валидация статуса
    if (!status || !Object.values(InvoiceStatus).includes(status)) {
      return res.status(400).json({ 
        error: 'status обязателен и должен быть одним из: pending, completed, expired' 
      });
    }

    const invoice = await invoiceService.updateInvoiceStatus(req.params.id, status);
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении статуса инвойса' });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await invoiceService.deleteInvoice(req.params.id);
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении инвойса' });
  }
}; 