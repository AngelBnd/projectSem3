const { z } = require("zod");

// Messages match the ones the auth service already returned for missing fields,
// so the frontend (Login / Register) shows the same text.
const required = (message) => ({ error: message });

const register = z.object({
  email: z
    .string(required("Email, password, and role are required"))
    .min(1, "Email, password, and role are required")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),
  password: z
    .string(required("Email, password, and role are required"))
    .min(1, "Email, password, and role are required"),
  role: z.enum(["owner", "employee"], {
    error: "Role must be 'owner' or 'employee'",
  }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  storeName: z.string().optional(),
  storeTag: z.string().optional(),
});

const login = z.object({
  email: z
    .string(required("Email and password are required"))
    .min(1, "Email and password are required"),
  password: z
    .string(required("Email and password are required"))
    .min(1, "Email and password are required"),
});

const validateField = z.object({
  field: z
    .string(required("Field and value are required"))
    .min(1, "Field and value are required"),
  value: z
    .string(required("Field and value are required"))
    .min(1, "Field and value are required"),
});

module.exports = { register, login, validateField };
