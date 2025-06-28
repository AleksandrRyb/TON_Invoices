import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, afterEach, jest } from '@jest/globals';
import { PrismaClient } from '../../src/generated/prisma';
import app from '../../src/app';
import { InvoiceStatus } from '../../src/constants/invoice';
import { Asset } from '../../src/constants/asset';

// Мокаем модуль конфига
jest.mock('../../src/config/env', () => ({
    env: {
        RECIPIENT_WALLET_ADDRESS: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
  },
}));
import { env } from '../../src/config/env'; // Импортируем мокнутый конфиг

const prisma = new PrismaClient();

describe('Invoice Endpoints', () => {
  let user: any;
  const testAddress = 'EQBYA_g-9Yj2-eHlGfA_Z3-UPzfs4WnJgG5IeJNbI4aISL4s';

  beforeAll(async () => {
    // Создаем одного пользователя для всех тестов в этом файле
    user = await prisma.user.create({
      data: {
        address: testAddress,
      },
    });
  });

  afterEach(async () => {
    // Удаляем все счета после каждого теста
    await prisma.invoice.deleteMany();
  });

  afterAll(async () => {
    // Удаляем пользователя и отключаемся от БД после всех тестов
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/invoices', () => {
    it('should create a new invoice successfully', async () => {
      const response = await request(app)
        .post('/api/invoices')
        .send({ address: testAddress, amount: '10.5' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('invoiceId');
      expect(response.body).toHaveProperty('amount', '10.500000'); // Prisma Decimal format
      expect(response.body).toHaveProperty('recipientAddress', env.RECIPIENT_WALLET_ADDRESS);

      const invoiceInDb = await prisma.invoice.findUnique({ where: { id: response.body.invoiceId } });
      expect(invoiceInDb).not.toBeNull();
      expect(invoiceInDb?.userId).toBe(user.id);
      expect(invoiceInDb?.status).toBe(InvoiceStatus.PENDING);
    });

    it('should return 401 if the user address does not exist', async () => {
      const response = await request(app)
        .post('/api/invoices')
        .send({ address: 'NON_EXISTENT_ADDRESS', amount: '10' });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Пользователь не найден');
    });

    it('should return 400 if amount is missing', async () => {
      const response = await request(app)
        .post('/api/invoices')
        .send({ address: testAddress });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Поля address и amount обязательны');
    });
  });

  describe('GET /api/invoices/:id', () => {
    it('should retrieve an invoice status successfully', async () => {
      const newInvoice = await prisma.invoice.create({
        data: {
          userId: user.id,
          amount: '25.0',
          asset: Asset.TON,
          status: InvoiceStatus.PENDING,
        },
      });

      const response = await request(app).get(`/api/invoices/${newInvoice.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(newInvoice.id);
      expect(response.body.status).toBe(InvoiceStatus.PENDING);
      expect(response.body.amount).toBe('25.000000');
    });

    it('should return 404 for a non-existent invoice ID', async () => {
      const nonExistentId = 'clx9dezo1000008l3fcz2h3a9'; // A valid UUID format, but doesn't exist
      const response = await request(app).get(`/api/invoices/${nonExistentId}`);

      expect(response.status).toBe(404);
    });
  });
}); 