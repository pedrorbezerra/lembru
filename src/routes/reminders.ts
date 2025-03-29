import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

  /**
   * This plugin registers the following routes:
   * - GET /reminders: Returns a list of all reminders, ordered by creation date
   * - GET /reminders/:id: Returns a reminder with the given id
   * - POST /reminders: Creates a new reminder with the given content, expiration date, and status
   * - PUT /reminders/:id: Updates a reminder with the given id, using the given content, expiration date, and status
   * - DELETE /reminders/:id: Deletes a reminder with the given id
   */
export async function remindersRoutes(app: FastifyInstance) {
  app.get('/reminders', async () => {
    const reminders = await prisma.reminder.findMany({
      orderBy: {
        created_at: 'asc',
      },
    });

    return reminders;
  });

  app.get('/reminders/:id', async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    const reminder = await prisma.reminder.findUniqueOrThrow({
      where: {
        id,
      },
    });

    return reminder;
  });

  app.post('/reminders', async (request) => {
    const bodySchema = z.object({
      content: z.string(),
      expires_at: z.string(),
      status: z.enum(['open', 'closed']),
    });

    const { content, expires_at, status } = bodySchema.parse(request.body);

    const reminder = await prisma.reminder.create({
      data: {
        content,
        expires_at,
        status,
        userId: 'ffce0b3c-e98c-446e-a8ab-2d638319b0e7',
      },
    });

    return reminder;
  });

  app.put('/reminders/:id', async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    const bodySchema = z.object({
      content: z.string(),
      status: z.enum(['open', 'closed']),
      expires_at: z.string(),
    });

    const { content, expires_at, status } = bodySchema.parse(request.body);

    const reminder = await prisma.reminder.update({
      where: {
        id,
      },
      data: {
        content,
        expires_at,
        status,
        userId: 'ffce0b3c-e98c-446e-a8ab-2d638319b0e7',
      },
    });

    return reminder;
  });

  app.delete('/reminders/:id', async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    await prisma.reminder.delete({
      where: {
        id,
      },
    });
  });
}
