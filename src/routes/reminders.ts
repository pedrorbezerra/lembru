import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function remindersRoutes(app: FastifyInstance) {
  app.get('/reminders', async () => {
    const reminders = await prisma.reminder.findMany({
      orderBy: {
        created_at: 'asc',
      },
    })

    return reminders
  })

  app.get('/reminders/:id', async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const reminder = await prisma.reminder.findUniqueOrThrow({
      where: {
        id,
      },
    })

    return reminder
  })

  app.post('/reminders', async (request) => {
    const bodySchema = z.object({
      content: z.string(),
      expires_at: z.string(),
    })

    const { content, expires_at } = bodySchema.parse(request.body)

    const reminder = await prisma.reminder.create({
      data: {
        content,
        expires_at,
        userId: 'ffce0b3c-e98c-446e-a8ab-2d638319b0e7',
      },
    })

    return reminder
  })

  app.put('/reminders/:id', async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      content: z.string(),
      expires_at: z.string(),
    })

    const { content, expires_at } = bodySchema.parse(request.body)

    const reminder = await prisma.reminder.update({
      where: {
        id,
      },
      data: {
        content,
        expires_at,
        userId: 'ffce0b3c-e98c-446e-a8ab-2d638319b0e7',
      },
    })

    return reminder
  })

  app.delete('/reminders/:id', async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    await prisma.reminder.delete({
      where: {
        id,
      },
    })
  })
}
