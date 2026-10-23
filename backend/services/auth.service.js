const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");
const { HttpError } = require("../utils/httpError");

const JWT_SECRET = process.env.JWT_SECRET;

const register = async ({
  email,
  password,
  role,
  firstName,
  lastName,
  phoneNumber,
  storeName,
  storeTag,
}) => {
  if (!email || !password || !role) {
    throw new HttpError(400, {
      error: "Email, password, and role are required",
    });
  }

  const existingUser = await prisma.users.findUnique({ where: { email } });
  if (existingUser) throw new HttpError(409, { error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  let result;

  if (role === "owner") {
    if (!storeName || !storeTag) {
      throw new HttpError(400, {
        error: "Store name and tag are required for owners",
      });
    }

    const existingStore = await prisma.stores.findUnique({
      where: { storeTag },
    });
    if (existingStore)
      throw new HttpError(400, { error: "Store tag already exists" });

    // Owner flow
    result = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          email,
          firstName: firstName || "",
          lastName: lastName || "",
          phoneNumber: phoneNumber || "",
          passwordHash: hashedPassword,
          status: "ACTIVE",
        },
      });
      const store = await tx.stores.create({
        data: {
          storeName,
          storeTag,
          ownerId: user.userId,
        },
      });

      await tx.userRoles.create({
        data: {
          userId: user.userId,
          roleId: 1,
          isPrimary: true,
        },
      });

      await tx.users.update({
        where: { userId: user.userId },
        data: { storeId: store.storeId },
      });

      return { user, store };
    });
  } else if (role === "employee") {
    if (!storeTag) throw new HttpError(400, { error: "Store tag is required" });

    const store = await prisma.stores.findUnique({ where: { storeTag } });
    if (!store) throw new HttpError(400, { error: "Store not found" });

    // Employee flow
    const user = await prisma.users.create({
      data: {
        storeId: store.storeId,
        email,
        firstName: firstName || "",
        lastName: lastName || "",
        phoneNumber: phoneNumber || "",
        passwordHash: hashedPassword,
        status: "PENDING_APPROVAL",
        requestedStoreTag: storeTag,
      },
    });

    result = { user };
  }

  return { message: "User registered successfully", result };
};

const login = async ({ email, password }) => {
  if (!email || !password)
    throw new HttpError(400, { error: "Email and password are required" });

  const user = await prisma.users.findUnique({
    where: { email },
    include: {
      store: true,
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  });

  if (!user) throw new HttpError(404, { error: "User not found" });

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new HttpError(401, { error: "Invalid credentials" });

  if (user.status === "PENDING_APPROVAL") {
    throw new HttpError(403, {
      code: "PENDING_APPROVAL",
      message: "Your request to join the store is still pending approval.",
      redirectTo: "/access-status",
    });
  }

  if (user.status === "REJECTED") {
    throw new HttpError(403, {
      success: false,
      code: "REJECTED",
      message: "Your request to join the store has been rejected.",
      redirectTo: "/access-status",
    });
  }

  const permissions = user.userRoles.flatMap((userRole) =>
    userRole.role.rolePermissions.map(
      (rp) => `${rp.permission.module}:${rp.permission.permission}`
    )
  );

  const roleNames = user.userRoles.map((ur) => ur.role.roleName);
  const primaryRole =
    user.userRoles.find((ur) => ur.isPrimary)?.role.roleName || roleNames[0];

  const token = jwt.sign(
    {
      userId: user.userId,
      store: user.store,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      primaryRole,
      permissions,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    success: true,
    token,
    user: {
      id: user.userId,
      store: user.store,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: roleNames,
      primaryRole,
      permissions,
    },
  };
};

const validateField = async ({ field, value }) => {
  if (!field || !value) {
    throw new HttpError(400, { error: "Field and value are required" });
  }

  if (field === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new HttpError(400, { error: "Invalid email format" });
    }

    const existingUser = await prisma.users.findUnique({
      where: { email: value },
    });
    if (existingUser) {
      throw new HttpError(409, { error: "Email already exists" });
    }
  } else if (field === "storeTag") {
    const existingStore = await prisma.stores.findUnique({
      where: { storeTag: value },
    });
    if (existingStore) {
      throw new HttpError(409, { error: "Store tag already exists" });
    }
  }

  return { valid: true, message: `${field} is available` };
};

module.exports = { register, login, validateField };
