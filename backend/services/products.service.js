const prisma = require("../prisma/client");
const { HttpError } = require("../utils/httpError");

const list = async (currentUser) => {
  console.log("CURRENT USER TEST", currentUser);

  if (!currentUser.storeId) {
    throw new HttpError(400, { error: "User does not belong to a store" });
  }

  return prisma.products.findMany({
    where: {
      storeId: currentUser.storeId,
    },
  });
};

module.exports = { list };
