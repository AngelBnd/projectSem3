const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ----- ROLES -----
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin', description: 'Full access' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: { name: 'User', description: 'Limited access' },
  });

  // ----- PERMISSIONS -----
    const permissions = [
    { entity: 'product', action: 'create', description: 'User can create a product (needs admin approval)' },
    { entity: 'product', action: 'approve', description: 'Admin can approve product creation' },
    { entity: 'product', action: 'update', description: 'Update products' },
    { entity: 'product', action: 'delete', description: 'Delete products' },
    { entity: 'product', action: 'view', description: 'View products' },

    { entity: 'invoice', action: 'create', description: 'User can create an invoice (needs admin approval)' },
    { entity: 'invoice', action: 'approve', description: 'Admin can approve invoice' },
    { entity: 'invoice', action: 'update', description: 'Update invoices' },
    { entity: 'invoice', action: 'delete', description: 'Delete invoices' },
    { entity: 'invoice', action: 'view', description: 'View invoices' },

    { entity: 'user', action: 'update', description: 'Update users' },
    { entity: 'user', action: 'delete', description: 'Delete users' },
    { entity: 'user', action: 'view', description: 'View users' },

    { entity: 'role', action: 'create', description: 'Create roles' },
    { entity: 'role', action: 'update', description: 'Update roles' },
    { entity: 'role', action: 'delete', description: 'Delete roles' },
    { entity: 'role', action: 'view', description: 'View roles' },

    { entity: 'auditLog', action: 'view', description: 'View audit logs' },
    { entity: 'auditLog', action: 'create', description: 'User can create an auditLog (needs admin approval)' },
    { entity: 'auditLog', action: 'approve', description: 'Admin can approve/review pending audit logs' },

    { entity: 'movement', action: 'view', description: 'View inventory movements' },
    ];

  const permissionRecords = [];
  for (const perm of permissions) {
    const record = await prisma.permission.upsert({
      where: { entity_action: { entity: perm.entity, action: perm.action } },
      update: {},
      create: perm,
    });
    permissionRecords.push(record);
  }

  // ----- ASSIGN PERMISSIONS -----
  // Admin gets all
  for (const perm of permissionRecords) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  const viewPermissions = permissionRecords.filter(p => p.action === 'view');
  for (const perm of viewPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: userRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: userRole.id, permissionId: perm.id },
    });
  }

  // ----- STORE -----
    const store = await prisma.store.upsert({
    where: { storeTag: 'DEV_STORE' },
    update: {},
    create: {
        name: 'Dev Store',
        storeTag: 'DEV_STORE',
        ownerId: null,  
    },
    });

       // ----- USERS -----
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('user123', salt);

    const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
        email: 'admin@example.com',
        username: 'Admin',
        password: adminPassword,
        roleId: adminRole.id,
        storeId: store.id,
    },
    });

    // Update store ownerId to the admin user
    await prisma.store.update({
    where: { id: store.id },
    data: { ownerId: adminUser.id },
    });

    const regularUser = await prisma.user.upsert({
    where: { email: 'user@dev.com' },
    update: {},
    create: {
        email: 'user@dev.com',
        username: 'Regular User', 
        password: userPassword,
        roleId: userRole.id,
        storeId: store.id,
    },
    });



  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });