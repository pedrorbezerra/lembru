import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcrypt';

export async function AuthRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const bodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string().min(6),
      familyId: z.string().optional(),
      familyName: z.string().optional(),
    });

    const { name, email, password, familyId, familyName } = bodySchema.parse(
      request.body
    );

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        return reply.status(400).send({ error: 'Email já registrado' });
      }

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      let family;

      if (familyId) {
        family = await prisma.family.findUnique({ where: { id: familyId } });

        if (!family) {
          return reply.status(400).send({ error: 'Familia não encontrada' });
        }
      } else if (familyName) {
        family = await prisma.family.create({
          data: {
            name: familyName,
          },
        });
      }

      if (family) {
        await prisma.familyMember.create({
          data: {
            userId: user.id,
            familyId: family.id,
            role: familyId ? 'member' : 'owner',
          },
        });
      }

      return reply.send({
        id: user.id,
        email: user.email,
        name: user.name,
        family: family ? { id: family.id, name: family.name } : null,
      });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Erro ao registrar usuário' });
    }
  });

  app.post('/login', async (request, reply) => {
    const bodySchema = z.object({
      email: z.string(),
      password: z.string(),
    });

    const { email, password } = bodySchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return reply.status(400).send({ error: 'Credenciais inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return reply.status(400).send({ error: 'Credenciais inválidas' });
    }

    const token = app.jwt.sign({ id: user.id, email: user.email });

    reply.send({ token });
  });

  app.post('/reset-password', async (request, reply) => {
    const bodySchema = z.object({
      email: z.string(),
      password: z.string(),
    });

    const { email, password } = bodySchema.parse(request.body);

    const validUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!validUser) {
      return reply.status(400).send({ error: 'Usuário não encontrado' });
    }

    await prisma.user.update({
      where: { email },
      data: {
        password: await bcrypt.hash(password, 10),
      },
    });

    reply.send('Senha atualizada com sucesso');
  });

  app.get('/me', { preHandler: [app.authenticate] }, async (request, reply) => {
    const user = request.user;
    reply.send(user);
  });
}
