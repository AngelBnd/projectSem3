require("dotenv").config();
const { z } = require("zod");

const envSchema = z.object({
  DATABASE_URL: z.string().startsWith("mysql://"),
  JWT_SECRET: z.string().min(64), // follows hs512 standard of minimum 64 bytes
  PORT: z.coerce.number(),
  BYPASS_AUTH: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

let result = envSchema.safeParse(process.env);
if (!result.success) {
  console.error(result.error.issues);
  process.exit(1);
}

const config = result.data;

if (process.env.NODE_ENV === "production" && config.BYPASS_AUTH) {
  console.error(
    "Refusing to start: BYPASS_AUTH must not be true in production.",
  );
  process.exit(1);
}

module.exports = config;
