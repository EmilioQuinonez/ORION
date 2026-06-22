import request from 'supertest';
import { app } from '../../../src/app.js';
import { prisma } from '../../../src/prisma.js';

describe('GET /api/health', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('debe retornar 200 o 503 con estructura correcta', async () => {
    const res = await request(app).get('/api/health');

    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('services');
    expect(res.body.services).toHaveProperty('database');
    expect(res.body.services).toHaveProperty('ollama');
  });

  it('debe incluir el número de acciones soportadas', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.services.supportedActions).toBeGreaterThanOrEqual(20);
  });
});
