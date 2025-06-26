import { Router } from 'express';
import * as invoiceController from '@controllers/invoiceController';
import { asyncHandler } from '@utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(invoiceController.getAllInvoices));
router.get('/:id', asyncHandler(invoiceController.getInvoiceById));
router.post('/', asyncHandler(invoiceController.createInvoice));
router.patch('/:id/status', asyncHandler(invoiceController.updateInvoiceStatus));
router.delete('/:id', asyncHandler(invoiceController.deleteInvoice));

export default router; 