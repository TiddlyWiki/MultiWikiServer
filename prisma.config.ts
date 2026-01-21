import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: "",
  },
})