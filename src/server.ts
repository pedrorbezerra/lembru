import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyAuth from '@fastify/auth'
import { remindersRoutes } from './routes/reminders'
import cors from '@fastify/cors'
import { AuthRoutes } from './routes/auth'
const app = fastify()

app.register(cors, {
  origin: ['localhost:3333'],
})

app.register(fastifyJwt, {
  secret:
    '7ad64379884170fd666f35fe2f65b72ff4e6775f9124e8d59e1dc884789b22239d171ca0b4f92652b3ccde9d35cac2b770464535306ac4a5eaa32c0c3f939721', // Substitua por uma chave segura e armazenada de forma segura
})

app.register(fastifyAuth)

app.register(remindersRoutes)

app.register(AuthRoutes)

app.decorate(
  'authenticate',
  async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' })
    }
  },
)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('server is runing')
  })
