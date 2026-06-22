import request from 'supertest';
import { app } from '../../../src/app.js';
import { prisma } from '../../../src/prisma.js';
import { DEFAULT_USER_ID, DEFAULT_USER_NAME } from '../../../src/util/constants.js';

describe('History API', () => {
  beforeAll(async () => {
    await prisma.user.upsert({
      where: { id: DEFAULT_USER_ID },
      create: { id: DEFAULT_USER_ID, name: DEFAULT_USER_NAME, role: 'admin' },
      update: {},
    });
  });

  afterAll(async () => {
    await prisma.message.deleteMany({ where: { userId: DEFAULT_USER_ID } });
    await prisma.$disconnect();
  });

  describe('GET /api/history', () => {
    it('debe retornar historial paginado', async () => {
      const res = await request(app).get('/api/history');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('messages');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.messages)).toBe(true);
    });

    it('debe soportar parámetros de paginación', async () => {
      const res = await request(app).get('/api/history?page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.data.pagination.limit).toBe(5);
    });

    it('debe rechazar paginación inválida', async () => {
      const res = await request(app).get('/api/history?page=0');
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/history/clear', () => {
    it('debe limpiar el historial', async () => {
      const res = await request(app).delete('/api/history/clear');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/history/:id', () => {
    it('debe retornar 404 para ID inexistente', async () => {
      const res = await request(app).delete('/api/history/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });
});
