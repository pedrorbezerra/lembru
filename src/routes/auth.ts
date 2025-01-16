import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcrypt';

export async function AuthRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const bodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    });

    const { name, email, password } = bodySchema.parse(request.body);

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      reply.send({ id: user.id, email: user.email, name: user.name });
    } catch (err) {
      reply.status(400).send({ error: 'Email já registrado' });
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

  app.get('/me', { preHandler: [app.authenticate] }, async (request, reply) => {
    const user = request.user;
    reply.send(user);
  });
}
