import { PrismaClient, RoleName } from '../src/generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear old data in correct order
  await prisma.staffAction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.tableSession.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.customer.deleteMany();
  console.log('🗑️  Cleared existing data');

  // ========== CREATE PERMISSIONS ==========
  console.log('\n📋 Creating permissions...');

  const permissions = [
    // Menu Items permissions
    {
      name: 'menu-items.create',
      description: 'Create menu items',
      resource: 'menu-items',
      action: 'create',
    },
    {
      name: 'menu-items.read',
      description: 'View menu items',
      resource: 'menu-items',
      action: 'read',
    },
    {
      name: 'menu-items.update',
      description: 'Update menu items',
      resource: 'menu-items',
      action: 'update',
    },
    {
      name: 'menu-items.delete',
      description: 'Delete menu items',
      resource: 'menu-items',
      action: 'delete',
    },

    // Categories permissions
    {
      name: 'categories.create',
      description: 'Create categories',
      resource: 'categories',
      action: 'create',
    },
    {
      name: 'categories.read',
      description: 'View categories',
      resource: 'categories',
      action: 'read',
    },
    {
      name: 'categories.update',
      description: 'Update categories',
      resource: 'categories',
      action: 'update',
    },
    {
      name: 'categories.delete',
      description: 'Delete categories',
      resource: 'categories',
      action: 'delete',
    },

    // Tables permissions
    {
      name: 'tables.create',
      description: 'Create tables',
      resource: 'tables',
      action: 'create',
    },
    {
      name: 'tables.read',
      description: 'View tables',
      resource: 'tables',
      action: 'read',
    },
    {
      name: 'tables.update',
      description: 'Update table status',
      resource: 'tables',
      action: 'update',
    },
    {
      name: 'tables.delete',
      description: 'Delete tables',
      resource: 'tables',
      action: 'delete',
    },

    // Customers permissions
    {
      name: 'customers.create',
      description: 'Create customers',
      resource: 'customers',
      action: 'create',
    },
    {
      name: 'customers.read',
      description: 'View customers',
      resource: 'customers',
      action: 'read',
    },
    {
      name: 'customers.update',
      description: 'Update customers',
      resource: 'customers',
      action: 'update',
    },
    {
      name: 'customers.delete',
      description: 'Delete customers',
      resource: 'customers',
      action: 'delete',
    },

    // Orders permissions
    {
      name: 'orders.create',
      description: 'Create orders',
      resource: 'orders',
      action: 'create',
    },
    {
      name: 'orders.read',
      description: 'View orders',
      resource: 'orders',
      action: 'read',
    },
    {
      name: 'orders.update',
      description: 'Update orders',
      resource: 'orders',
      action: 'update',
    },
    {
      name: 'orders.delete',
      description: 'Delete orders',
      resource: 'orders',
      action: 'delete',
    },
    {
      name: 'orders.cancel',
      description: 'Cancel orders',
      resource: 'orders',
      action: 'cancel',
    },

    // Users permissions
    {
      name: 'users.create',
      description: 'Create users',
      resource: 'users',
      action: 'create',
    },
    {
      name: 'users.read',
      description: 'View users',
      resource: 'users',
      action: 'read',
    },
    {
      name: 'users.update',
      description: 'Update users',
      resource: 'users',
      action: 'update',
    },
    {
      name: 'users.delete',
      description: 'Delete users',
      resource: 'users',
      action: 'delete',
    },

    // Roles permissions
    {
      name: 'roles.create',
      description: 'Create roles',
      resource: 'roles',
      action: 'create',
    },
    {
      name: 'roles.read',
      description: 'View roles',
      resource: 'roles',
      action: 'read',
    },
    {
      name: 'roles.update',
      description: 'Update roles',
      resource: 'roles',
      action: 'update',
    },
    {
      name: 'roles.delete',
      description: 'Delete roles',
      resource: 'roles',
      action: 'delete',
    },

    // Reports permissions
    {
      name: 'reports.view',
      description: 'View reports',
      resource: 'reports',
      action: 'read',
    },
    {
      name: 'reports.export',
      description: 'Export reports',
      resource: 'reports',
      action: 'export',
    },

    // Kitchen permissions
    {
      name: 'kitchen.view-orders',
      description: 'View kitchen orders',
      resource: 'kitchen',
      action: 'read',
    },
    {
      name: 'kitchen.update-status',
      description: 'Update order cooking status',
      resource: 'kitchen',
      action: 'update',
    },

    // Payment permissions
    {
      name: 'payments.process',
      description: 'Process payments',
      resource: 'payments',
      action: 'create',
    },
    {
      name: 'payments.refund',
      description: 'Refund payments',
      resource: 'payments',
      action: 'refund',
    },

    // Module Access permissions (for frontend navigation)
    {
      name: 'module.admin.access',
      description: 'Access admin module',
      resource: 'module',
      action: 'admin-access',
    },
    {
      name: 'module.waiter.access',
      description: 'Access waiter module',
      resource: 'module',
      action: 'waiter-access',
    },
    {
      name: 'module.kitchen.access',
      description: 'Access kitchen module',
      resource: 'module',
      action: 'kitchen-access',
    },
    {
      name: 'module.cashier.access',
      description: 'Access cashier module',
      resource: 'module',
      action: 'cashier-access',
    },
  ];

  const createdPermissions = await Promise.all(
    permissions.map((p) => prisma.permission.create({ data: p })),
  );
  console.log(`✅ Created ${createdPermissions.length} permissions`);

  // ========== CREATE ROLES ==========
  console.log('\n👥 Creating roles...');

  const adminRole = await prisma.role.create({
    data: {
      name: RoleName.ADMIN,
      displayName: 'Administrator',
      description: 'Full system access with all permissions',
    },
  });

  const managerRole = await prisma.role.create({
    data: {
      name: RoleName.MANAGER,
      displayName: 'Manager',
      description: 'Manage operations, view reports, manage staff',
    },
  });

  const cashierRole = await prisma.role.create({
    data: {
      name: RoleName.CASHIER,
      displayName: 'Cashier',
      description: 'Process orders and payments',
    },
  });

  const waiterRole = await prisma.role.create({
    data: {
      name: RoleName.WAITER,
      displayName: 'Waiter',
      description: 'Take orders and manage tables',
    },
  });

  const kitchenRole = await prisma.role.create({
    data: {
      name: RoleName.KITCHEN,
      displayName: 'Kitchen Staff',
      description: 'View and update cooking orders',
    },
  });

  console.log('✅ Created 5 roles: Admin, Manager, Cashier, Waiter, Kitchen');

  // ========== ASSIGN PERMISSIONS TO ROLES ==========
  console.log('\n🔐 Assigning permissions to roles...');

  // Admin: ALL permissions
  const allPermissionIds = createdPermissions.map((p) => p.id);
  await Promise.all(
    allPermissionIds.map((permissionId) =>
      prisma.rolePermission.create({
        data: { roleId: adminRole.id, permissionId },
      }),
    ),
  );
  console.log(`✅ Admin: ${allPermissionIds.length} permissions`);

  // Manager: Most permissions except user/role management + access to all modules
  const managerPermissionNames = [
    'menu-items.create',
    'menu-items.read',
    'menu-items.update',
    'menu-items.delete',
    'categories.create',
    'categories.read',
    'categories.update',
    'categories.delete',
    'tables.create',
    'tables.read',
    'tables.update',
    'tables.delete',
    'customers.create',
    'customers.read',
    'customers.update',
    'customers.delete',
    'orders.create',
    'orders.read',
    'orders.update',
    'orders.delete',
    'orders.cancel',
    'users.read',
    'reports.view',
    'reports.export',
    'payments.process',
    'payments.refund',
    'module.admin.access',
    'module.waiter.access',
    'module.kitchen.access',
    'module.cashier.access',
  ];
  const managerPermissions = createdPermissions.filter((p) =>
    managerPermissionNames.includes(p.name),
  );
  await Promise.all(
    managerPermissions.map((p) =>
      prisma.rolePermission.create({
        data: { roleId: managerRole.id, permissionId: p.id },
      }),
    ),
  );
  console.log(`✅ Manager: ${managerPermissions.length} permissions`);

  // Cashier: Orders, payments, customers, view menu + access cashier module
  const cashierPermissionNames = [
    'menu-items.read',
    'categories.read',
    'tables.read',
    'tables.update',
    'customers.create',
    'customers.read',
    'customers.update',
    'orders.create',
    'orders.read',
    'orders.update',
    'payments.process',
    'payments.refund',
    'module.cashier.access',
  ];
  const cashierPermissions = createdPermissions.filter((p) =>
    cashierPermissionNames.includes(p.name),
  );
  await Promise.all(
    cashierPermissions.map((p) =>
      prisma.rolePermission.create({
        data: { roleId: cashierRole.id, permissionId: p.id },
      }),
    ),
  );
  console.log(`✅ Cashier: ${cashierPermissions.length} permissions`);

  // Waiter: Tables, orders, view menu and customers + access waiter module
  const waiterPermissionNames = [
    'menu-items.read',
    'categories.read',
    'tables.read',
    'tables.update',
    'customers.read',
    'orders.create',
    'orders.read',
    'orders.update',
    'module.waiter.access',
  ];
  const waiterPermissions = createdPermissions.filter((p) =>
    waiterPermissionNames.includes(p.name),
  );
  await Promise.all(
    waiterPermissions.map((p) =>
      prisma.rolePermission.create({
        data: { roleId: waiterRole.id, permissionId: p.id },
      }),
    ),
  );
  console.log(`✅ Waiter: ${waiterPermissions.length} permissions`);

  // Kitchen: View orders and update cooking status + access kitchen module
  const kitchenPermissionNames = [
    'menu-items.read',
    'orders.read',
    'kitchen.view-orders',
    'kitchen.update-status',
    'module.kitchen.access',
  ];
  const kitchenPermissions = createdPermissions.filter((p) =>
    kitchenPermissionNames.includes(p.name),
  );
  await Promise.all(
    kitchenPermissions.map((p) =>
      prisma.rolePermission.create({
        data: { roleId: kitchenRole.id, permissionId: p.id },
      }),
    ),
  );
  console.log(`✅ Kitchen: ${kitchenPermissions.length} permissions`);

  // ========== CREATE USERS ==========
  console.log('\n👤 Creating users...');
  const salt = await bcrypt.genSalt(10);

  // Admin user
  await prisma.user.create({
    data: {
      name: 'Admin User',
      username: 'admin',
      password: await bcrypt.hash('admin123', salt),
      roleId: adminRole.id,
      isActive: true,
    },
  });

  // Manager user
  await prisma.user.create({
    data: {
      name: 'John Manager',
      username: 'manager',
      password: await bcrypt.hash('manager123', salt),
      roleId: managerRole.id,
      isActive: true,
    },
  });

  // Cashier users
  await prisma.user.create({
    data: {
      name: 'Sarah Cashier',
      username: 'cashier1',
      password: await bcrypt.hash('cashier123', salt),
      roleId: cashierRole.id,
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Mike Cashier',
      username: 'cashier2',
      password: await bcrypt.hash('cashier123', salt),
      roleId: cashierRole.id,
      isActive: true,
    },
  });

  // Waiter users
  await prisma.user.create({
    data: {
      name: 'Emily Waiter',
      username: 'waiter1',
      password: await bcrypt.hash('waiter123', salt),
      roleId: waiterRole.id,
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      name: 'David Waiter',
      username: 'waiter2',
      password: await bcrypt.hash('waiter123', salt),
      roleId: waiterRole.id,
      isActive: true,
    },
  });

  // Kitchen users
  await prisma.user.create({
    data: {
      name: 'Chef Robert',
      username: 'kitchen1',
      password: await bcrypt.hash('kitchen123', salt),
      roleId: kitchenRole.id,
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Chef Maria',
      username: 'kitchen2',
      password: await bcrypt.hash('kitchen123', salt),
      roleId: kitchenRole.id,
      isActive: true,
    },
  });

  console.log(
    '✅ Created 8 users (1 admin, 1 manager, 2 cashiers, 2 waiters, 2 kitchen staff)',
  );
  console.log('   Login credentials:');
  console.log('   - admin/admin123');
  console.log('   - manager/manager123');
  console.log('   - cashier1/cashier123, cashier2/cashier123');
  console.log('   - waiter1/waiter123, waiter2/waiter123');
  console.log('   - kitchen1/kitchen123, kitchen2/kitchen123');

  console.log('\n🍽️  Creating restaurant data...');

  // Create categories
  const comboCategory = await prisma.category.create({
    data: {
      name: 'Combo',
      description: 'Value combo meals',
      displayOrder: 1,
      isActive: true,
    },
  });
  const friedChickenCategory = await prisma.category.create({
    data: {
      name: 'Fried Chicken',
      description: 'Crispy fried chicken pieces',
      displayOrder: 2,
      isActive: true,
    },
  });
  const burgerCategory = await prisma.category.create({
    data: {
      name: 'Burger',
      description: 'Delicious chicken burgers',
      displayOrder: 3,
      isActive: true,
    },
  });
  const sideCategory = await prisma.category.create({
    data: {
      name: 'Side',
      description: 'Side dishes and snacks',
      displayOrder: 4,
      isActive: true,
    },
  });
  const drinkCategory = await prisma.category.create({
    data: {
      name: 'Drink',
      description: 'Refreshing beverages',
      displayOrder: 5,
      isActive: true,
    },
  });

  console.log('✅ Created 5 categories successfully!');

  // Create sample menu items
  const menuItems = await prisma.menuItem.createMany({
    data: [
      // Combo
      {
        name: '1pc Chicken + Pepsi Combo',
        description: '1 piece of fried chicken with Pepsi',
        price: 4.99,
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec',
        categoryId: comboCategory.id,
        tags: ['Combo', 'Popular'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: '2pc Chicken + Fries + Pepsi Combo',
        description: '2 pieces of fried chicken with fries and Pepsi',
        price: 8.99,
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710',
        categoryId: comboCategory.id,
        tags: ['Combo', 'Best Seller'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: '3pc Chicken + 2 Fries + 2 Pepsi Combo',
        description: '3 pieces of fried chicken with 2 fries and 2 Pepsi',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0',
        categoryId: comboCategory.id,
        tags: ['Combo', 'Value'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Family Combo (6pc + 3 Fries + 4 Drinks)',
        description: 'Family combo: 6 chicken pieces, 3 fries, 4 drinks',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec',
        categoryId: comboCategory.id,
        tags: ['Combo', 'Family', 'Value'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Party Combo (9pc + 4 Fries + 6 Drinks)',
        description: 'Party combo: 9 chicken pieces, 4 fries, 6 drinks',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec',
        categoryId: comboCategory.id,
        tags: ['Combo', 'Party', 'Value'],
        isAvailable: true,
        isActive: true,
      },

      // Fried Chicken
      {
        name: 'Crispy Spicy Chicken (1pc)',
        description: 'Crispy spicy fried chicken - 1 piece',
        price: 3.99,
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710',
        categoryId: friedChickenCategory.id,
        tags: ['Spicy', 'Popular'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Traditional Fried Chicken (1pc)',
        description: 'Traditional fried chicken - 1 piece',
        price: 3.49,
        image: 'https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0',
        categoryId: friedChickenCategory.id,
        tags: ['Classic'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Boneless Chicken Strips (3pc)',
        description: 'Boneless fried chicken - 3 pieces',
        price: 4.99,
        image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec',
        categoryId: friedChickenCategory.id,
        tags: ['Boneless', 'Kids Favorite'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Crispy Spicy Chicken (2pc)',
        description: 'Crispy spicy fried chicken - 2 pieces',
        price: 7.49,
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec',
        categoryId: friedChickenCategory.id,
        tags: ['Spicy', 'Value'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Traditional Fried Chicken (3pc)',
        description: 'Traditional fried chicken - 3 pieces',
        price: 9.99,
        categoryId: friedChickenCategory.id,
        tags: ['Classic', 'Value'],
        isAvailable: true,
        isActive: true,
      },

      // Burgers
      {
        name: 'Crispy Chicken Burger',
        description: 'Crispy chicken burger with fresh lettuce',
        price: 4.49,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
        categoryId: burgerCategory.id,
        tags: ['Burger', 'Popular'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Teriyaki Chicken Burger',
        description: 'Teriyaki glazed chicken burger',
        price: 4.99,
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
        categoryId: burgerCategory.id,
        tags: ['Burger', 'Special'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Chicken Cheeseburger',
        description: 'Chicken burger with melted cheese',
        price: 5.49,
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add',
        categoryId: burgerCategory.id,
        tags: ['Burger', 'Cheese', 'Best Seller'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Special Spicy Chicken Burger',
        description: 'Extra spicy chicken burger with special sauce',
        price: 5.99,
        image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9',
        categoryId: burgerCategory.id,
        tags: ['Burger', 'Spicy', 'Premium'],
        isAvailable: true,
        isActive: true,
      },

      // Sides
      {
        name: 'French Fries (Medium)',
        description: 'Crispy golden french fries',
        price: 2.49,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877',
        categoryId: sideCategory.id,
        tags: ['Side', 'Popular'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'French Fries (Large)',
        description: 'Extra large crispy fries',
        price: 3.49,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877',
        categoryId: sideCategory.id,
        tags: ['Side', 'Value'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Cheese Shaker Fries',
        description: 'Fries tossed with savory cheese powder',
        price: 2.99,
        categoryId: sideCategory.id,
        tags: ['Side', 'Cheese', 'Premium'],
        isAvailable: true,
        isActive: true,
      },

      // Drinks
      {
        name: 'Pepsi (Can)',
        description: 'Pepsi cola - 330ml can',
        price: 1.49,
        image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e',
        categoryId: drinkCategory.id,
        tags: ['Drink', 'Cold'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Pepsi (Cup)',
        description: 'Pepsi cola - Medium cup',
        price: 0.99,
        categoryId: drinkCategory.id,
        tags: ['Drink', 'Cold'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: '7Up (Can)',
        description: '7Up lemon lime - 330ml can',
        price: 1.49,
        categoryId: drinkCategory.id,
        tags: ['Drink', 'Cold'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Mirinda (Can)',
        description: 'Mirinda orange - 330ml can',
        price: 1.49,
        categoryId: drinkCategory.id,
        tags: ['Drink', 'Cold'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Bottled Water',
        description: 'Pure drinking water - 500ml',
        price: 0.99,
        categoryId: drinkCategory.id,
        tags: ['Drink', 'Healthy'],
        isAvailable: true,
        isActive: true,
      },

      // Inactive Items
      {
        name: 'Cheese Sauce Chicken (Discontinued)',
        description: 'Cheese sauce chicken - No longer available',
        price: 5.99,
        categoryId: friedChickenCategory.id,
        tags: ['Discontinued'],
        isAvailable: false,
        isActive: false,
      },
      {
        name: 'Garlic Butter Burger (Discontinued)',
        description: 'Garlic butter chicken burger - No longer available',
        price: 5.99,
        categoryId: burgerCategory.id,
        tags: ['Discontinued'],
        isAvailable: false,
        isActive: false,
      },
    ],
  });

  console.log(`✅ Created ${menuItems.count} menu items successfully!`);

  // Create tables with locations
  const tables = await prisma.table.createMany({
    data: [
      { number: 1, capacity: 2, location: 'Ground Floor' },
      { number: 2, capacity: 2, location: 'Ground Floor' },
      { number: 3, capacity: 4, location: 'Ground Floor' },
      { number: 4, capacity: 4, location: 'Ground Floor' },
      { number: 5, capacity: 6, location: 'First Floor' },
      { number: 6, capacity: 6, location: 'First Floor' },
      { number: 7, capacity: 8, location: 'First Floor' },
      { number: 8, capacity: 8, location: 'First Floor' },
      { number: 9, capacity: 4, location: 'Outdoor' },
      { number: 10, capacity: 4, location: 'Outdoor' },
    ],
  });

  console.log(`✅ Created ${tables.count} tables successfully!`);

  // Create customers
  const customers = await prisma.customer.createMany({
    data: [
      {
        name: 'John Smith',
        phone: '0901234567',
        email: 'john.smith@example.com',
        isActive: true,
      },
      {
        name: 'Sarah Johnson',
        phone: '0912345678',
        email: 'sarah.j@example.com',
        isActive: true,
      },
      {
        name: 'Michael Brown',
        phone: '0923456789',
        email: 'michael.b@example.com',
        isActive: true,
      },
      {
        name: 'Emily Davis',
        phone: '0934567890',
        email: 'emily.d@example.com',
        isActive: true,
      },
      {
        name: 'David Wilson',
        phone: '0945678901',
        email: 'david.w@example.com',
        isActive: true,
      },
      { name: 'Jessica Garcia', phone: '0956789012', isActive: true },
      { name: 'James Martinez', phone: '0967890123', isActive: true },
      { name: 'Lisa Anderson', phone: '0978901234', isActive: true },
      { name: 'Robert Taylor', phone: '0989012345', isActive: true },
      { name: 'Jennifer Lee', phone: '0990123456', isActive: true },
    ],
  });

  console.log(`✅ Created ${customers.count} customers successfully!`);

  console.log('\n✨ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('👋 Database connection closed');
  });
