const { UserStoreStatus } = require("@prisma/client");
const prisma = require("../prisma/client");
const { HttpError } = require("../utils/httpError");

const listStoreUsers = async (currentUser) => {
  console.log(currentUser);

  if (!currentUser.storeId) {
    throw new HttpError(400, { error: "User does not belong to a store" });
  }

  const users = await prisma.users.findMany({
    where: {
      OR: [
        { storeId: currentUser.store?.storeId },
        {
          AND: [
            { requestedStoreTag: currentUser.store?.storeTag },
            { status: UserStoreStatus.PENDING_APPROVAL },
          ],
        },
      ],
    },
    include: {
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

  console.log("BACKEND USERS==========");
  console.log(users);

  return { users };
};

// Shared by approve/reject: load target, enforce same-store, apply update.
const changeStatus = async (currentUser, userId, action, buildData) => {
  const targetUser = await prisma.users.findUnique({
    where: { userId: parseInt(userId) },
  });
  if (!targetUser) throw new HttpError(404, { error: "User not found" });

  if (targetUser.storeId !== currentUser.storeId) {
    throw new HttpError(403, {
      error: `Cannot ${action} user from another store`,
    });
  }

  const updatedUser = await prisma.users.update({
    where: { userId: parseInt(userId) },
    data: buildData(),
  });

  return { success: true, user: updatedUser };
};

const approve = (currentUser, userId) =>
  changeStatus(currentUser, userId, "approve", () => ({
    status: UserStoreStatus.ACTIVE,
    approvedAt: new Date(),
    approvedBy: currentUser.userId,
  }));

const reject = (currentUser, userId) =>
  changeStatus(currentUser, userId, "reject", () => ({
    status: UserStoreStatus.REJECTED,
    approvedAt: new Date(),
    approvedBy: currentUser.userId,
    requestedStoreTag: null,
  }));

module.exports = { listStoreUsers, approve, reject };
