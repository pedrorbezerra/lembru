import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

export async function FamiliesRoutes(app: FastifyInstance) {
  app.post('/families/:familyId/deposit', async (request, reply) => {
    const bodySchema = z.object({
      amount: z.number().positive(),
      userId: z.string(),
    });

    const { amount, userId } = bodySchema.parse(request.body);
    const { familyId } = request.params as { familyId: string };

    try {
      const family = await prisma.family.findUnique({
        where: { id: familyId },
      });

      if (!family) {
        return reply.status(404).send({ error: 'Família não encontrada' });
      }

      const isMember = await prisma.familyMember.findFirst({
        where: { familyId, userId },
      });

      if (!isMember) {
        return reply
          .status(403)
          .send({ error: 'Usuário não pertence a essa família' });
      }

      const updatedFamily = await prisma.family.update({
        where: { id: familyId },
        data: { balance: { increment: amount } },
      });

      return reply.send({
        message: 'Saldo adicionado com sucesso',
        balance: updatedFamily.balance,
      });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Erro ao adicionar saldo' });
    }
  });

  app.post('/families/:familyId/withdraw', async (request, reply) => {
    const bodySchema = z.object({
      amount: z.number().positive(),
      userId: z.string(),
    });

    const { amount, userId } = bodySchema.parse(request.body);
    const { familyId } = request.params as { familyId: string };

    try {
      const family = await prisma.family.findUnique({
        where: { id: familyId },
      });

      if (!family) {
        return reply.status(404).send({ error: 'Família não encontrada' });
      }

      const isMember = await prisma.familyMember.findFirst({
        where: { familyId, userId },
      });

      if (!isMember) {
        return reply
          .status(403)
          .send({ error: 'Usuário não pertence a essa família' });
      }

      if (Number(family.balance) < amount) {
        return reply.status(400).send({ error: 'Saldo insuficiente' });
      }

      const updatedFamily = await prisma.family.update({
        where: { id: familyId },
        data: { balance: { decrement: amount } },
      });

      return reply.send({
        message: 'Saldo retirado com sucesso',
        balance: updatedFamily.balance,
      });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Erro ao retirar saldo' });
    }
  });

  app.get('/families/:familyId/balance', async (request, reply) => {
    const { familyId } = request.params as { familyId: string };

    try {
      const family = await prisma.family.findUnique({
        where: { id: familyId },
        select: { balance: true, id: true },
      });

      if (!family) {
        return reply.status(404).send({ error: 'Família não encontrada' });
      }

      return reply.send({
        balance: Number(family.balance),
        familyId: family.id,
      });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Erro ao buscar saldo' });
    }
  });

  app.post('/categories', async (request, reply) => {
    const bodySchema = z.object({
      category: z.string(),
    });

    const { category } = bodySchema.parse(request.body);

    try {
      const categoryAlreadyExists = await prisma.category.findFirst({
        where: { name: category },
      });

      if (categoryAlreadyExists) {
        return reply.status(400).send({ error: 'Categoria já existe' });
      }

      const createdCategories = await prisma.category.create({
        data: { name: category },
      });

      return reply.send({
        message: 'Categoria criada com sucesso',
        category: createdCategories,
      });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Erro ao criar categorias' });
    }
  });

  app.post('/families/:familyId/expenses', async (request, reply) => {
    const bodySchema = z.object({
      title: z.string(),
      description: z.string(),
      amount: z.number().positive(),
      categoryId: z.string(),
      userId: z.string(),
    });

    const { title, description, amount, categoryId, userId } = bodySchema.parse(
      request.body
    );
    const { familyId } = request.params as { familyId: string };

    try {
      const family = await prisma.family.findUnique({
        where: { id: familyId },
      });
      if (!family) {
        return reply.status(404).send({ error: 'Família não encontrada' });
      }

      const isMember = await prisma.familyMember.findFirst({
        where: { familyId, userId },
      });
      if (!isMember) {
        return reply
          .status(403)
          .send({ error: 'Usuário não pertence a essa família' });
      }

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return reply.status(404).send({ error: 'Categoria não encontrada' });
      }

      const expense = await prisma.expense.create({
        data: {
          title,
          description,
          amount: amount,
          categoryId,
          userId,
          familyId,
        },
      });

      const updatedFamily = await prisma.family.update({
        where: { id: familyId },
        data: { balance: { decrement: amount } },
      });

      return reply.send({
        message: 'Gasto registrado com sucesso',
        expense,
        updatedBalance: updatedFamily.balance,
      });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Erro ao registrar o gasto' });
    }
  });
}
