import { Request, Response } from 'express';
import * as invoiceService from '@services/invoiceService';

export const getAllInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await invoiceService.getAllInvoices();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении инвойсов' });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Инвойс не найден' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении инвойса' });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const { amount, asset, status, userId, expiresAt, txHash } = req.body;
    if (!amount || !asset || !status || !userId) {
      return res.status(400).json({ error: 'amount, asset, status, userId обязательны' });
    }
    const invoice = await invoiceService.createInvoice({ amount, asset, status, userId, expiresAt, txHash });
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании инвойса' });
  }
};

export const updateInvoiceStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status обязателен' });
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