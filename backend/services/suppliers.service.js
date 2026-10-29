const prisma = require("../prisma/client");
const { HttpError } = require("../utils/httpError");

const list = async (currentUser) => {
  console.log("CURRENT USER TEST", currentUser);

  if (!currentUser.storeId) {
    throw new HttpError(400, { error: "User does not belong to a store" });
  }

  return prisma.suppliers.findMany({
    where: {
      storeId: currentUser.storeId,
    },
    select: {
      supplierId: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
};

module.exports = { list };
