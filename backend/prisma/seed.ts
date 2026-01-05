import { PrismaClient, RoleName, Prisma } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Set Faker seed for consistent data generation
faker.seed(12345);

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

    // Reservations permissions
    {
      name: 'reservations.create',
      description: 'Create reservations',
      resource: 'reservations',
      action: 'create',
    },
    {
      name: 'reservations.read',
      description: 'View reservations',
      resource: 'reservations',
      action: 'read',
    },
    {
      name: 'reservations.update',
      description: 'Update reservations',
      resource: 'reservations',
      action: 'update',
    },
    {
      name: 'reservations.delete',
      description: 'Delete reservations',
      resource: 'reservations',
      action: 'delete',
    },
    {
      name: 'reservations.confirm',
      description: 'Confirm reservations',
      resource: 'reservations',
      action: 'confirm',
    },
    {
      name: 'reservations.cancel',
      description: 'Cancel reservations',
      resource: 'reservations',
      action: 'cancel',
    },

    // Notification permissions
    {
      name: 'notifications.read',
      description: 'View notifications',
      resource: 'notifications',
      action: 'read',
    },
    {
      name: 'notifications.manage',
      description: 'Manage notifications',
      resource: 'notifications',
      action: 'manage',
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
    'reservations.create',
    'reservations.read',
    'reservations.update',
    'reservations.delete',
    'reservations.confirm',
    'reservations.cancel',
    'users.read',
    'reports.view',
    'reports.export',
    'payments.process',
    'payments.refund',
    'notifications.read',
    'notifications.manage',
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
    'reservations.read',
    'payments.process',
    'payments.refund',
    'notifications.read',
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
    'reservations.read',
    'reservations.confirm',
    'notifications.read',
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
    'notifications.read',
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

  // Create sample menu items with real images
  const menuItems = await prisma.menuItem.createMany({
    data: [
      // Combo Meals - Premium Value Sets
      {
        name: 'Classic Chicken Combo',
        description: 'Our signature fried chicken piece served with golden fries and refreshing Pepsi. Perfect for a quick, satisfying meal.',
        price: 5.99,
        image: 'https://cdn.sanity.io/images/czqk28jt/prod_plk_us/3e04cf76b6993b2a4e8d276197831fc49f97c794-2000x1333.png?q=80&auto=format',
        categoryId: comboCategory.id,
        tags: ['Combo', 'Popular', 'Best Value'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Double Crunch Meal',
        description: '2 pieces of our crispy fried chicken with regular fries and choice of drink. Great for moderate appetite.',
        price: 9.99,
        image: 'https://foodiefellas.co.uk/wp-content/uploads/2024/05/double-crunch-master-burger-with-box-min.png',
        categoryId: comboCategory.id,
        tags: ['Combo', 'Best Seller', 'Recommended'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Trio Power Box',
        description: '3 succulent chicken pieces paired with 2 regular fries and 2 drinks. Ideal for sharing or solo indulgence.',
        price: 14.99,
        image: 'https://res.cloudinary.com/dbq5ulk6b/image/upload/v1766333336/1_wzadop.png',
        categoryId: comboCategory.id,
        tags: ['Combo', 'Value', 'Popular'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Family Feast',
        description: 'Perfect family meal with 6 crispy chicken pieces, 3 large fries, and 4 drinks. Serves 3-4 people comfortably.',
        price: 27.99,
        image: 'https://res.cloudinary.com/dbq5ulk6b/image/upload/v1766333482/2_gyybu1.png',
        categoryId: comboCategory.id,
        tags: ['Combo', 'Family', 'Value', 'Best Seller'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Party Bucket',
        description: 'Ultimate party package! 9 pieces of golden fried chicken, 4 large fries, and 6 beverages. Perfect for gatherings.',
        price: 39.99,
        image: 'https://res.cloudinary.com/dbq5ulk6b/image/upload/v1766333668/3_swaxzw.png',
        categoryId: comboCategory.id,
        tags: ['Combo', 'Party', 'Value', 'Sharing'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Mega Feast Box',
        description: 'The ultimate value combo with 5 chicken pieces, 3 fries, 2 burgers, and 4 drinks. Feed the whole crew!',
        price: 32.99,
        image: 'https://res.cloudinary.com/dbq5ulk6b/image/upload/v1766334138/4_itqurq.png',
        categoryId: comboCategory.id,
        tags: ['Combo', 'Premium', 'Family', 'Best Value'],
        isAvailable: true,
        isActive: true,
      },

      // Fried Chicken - Fresh & Crispy
      {
        name: 'Original Crispy Chicken (1pc)',
        description: 'Our legendary original recipe fried chicken. Crispy on the outside, juicy on the inside. A timeless classic.',
        price: 3.99,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkQO371YtMvaDRWJ3hrc79Q0CTe8oFZmBDGA&s',
        categoryId: friedChickenCategory.id,
        tags: ['Spicy', 'Popular', 'Signature'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Southern Fried Chicken (1pc)',
        description: 'Traditional Southern-style fried chicken seasoned with our secret blend of 11 herbs and spices.',
        price: 3.49,
        image: 'https://www.crimsoncoward.com/wp-content/uploads/2023/10/3Chicken-Tenders.png',
        categoryId: friedChickenCategory.id,
        tags: ['Classic', 'Traditional'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Crispy Tenders (3pc)',
        description: 'Premium boneless chicken strips breaded with our signature coating. Perfect for kids and tender lovers.',
        price: 5.49,
        image: 'https://i0.wp.com/carlsjr.com.sg/wp-content/uploads/2023/11/3-piece-hand-breaded-chicken-tenders.png?fit=1000%2C1000&ssl=1',
        categoryId: friedChickenCategory.id,
        tags: ['Boneless', 'Kids Favorite', 'Popular'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Hot & Spicy Chicken (2pc)',
        description: '2 pieces of extra crispy chicken with a fiery kick. For those who love it hot! Contains chili peppers.',
        price: 7.99,
        image: 'https://jackinthebox-menuus.com/wp-content/uploads/2025/08/2PC-Hot-Honey-Spicy-Chicken-Strips-Snack-Box-768x499.webp',
        categoryId: friedChickenCategory.id,
        tags: ['Spicy', 'Hot', 'Popular'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Classic Fried Chicken (3pc)',
        description: 'Triple the delight! 3 pieces of our golden-fried chicken prepared fresh daily. Great value for big appetites.',
        price: 10.99,
        image: 'https://cdn.sanity.io/images/czqk28jt/prod_plk_us/84bbcd43ce0d00ab85cc40e4c23f007e19501d21-2000x1333.png?q=80&auto=format',
        categoryId: friedChickenCategory.id,
        tags: ['Classic', 'Value', 'Popular'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Chicken Wings (6pc)',
        description: 'Half dozen of our famous crispy chicken wings tossed in choice of sauce: BBQ, Buffalo, or Honey Garlic.',
        price: 8.99,
        image: 'https://www.buyfreshonline.co.uk/wp-content/uploads/2024/09/Tandoori-Chicken-Wings.webp',
        categoryId: friedChickenCategory.id,
        tags: ['Wings', 'Popular', 'Snack'],
        isAvailable: true,
        isActive: true,
      },

      // Burgers - Gourmet Sandwiches
      {
        name: 'Classic Crispy Burger',
        description: 'Crispy fried chicken fillet with fresh lettuce, tomato, and our signature mayo on a toasted brioche bun.',
        price: 5.49,
        image: 'https://www.hungryjacks.com.au/Upload/HJ/Media/UNO/HJ00571_WEB_Jack%CE%93COs-Fried-Chicken-classic_800X600_1.png',
        categoryId: burgerCategory.id,
        tags: ['Burger', 'Popular', 'Classic'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Teriyaki Glazed Burger',
        description: 'Juicy chicken breast glazed with sweet teriyaki sauce, topped with grilled pineapple and crisp lettuce.',
        price: 6.49,
        image: 'https://static.vecteezy.com/system/resources/thumbnails/069/662/328/small_2x/closeup-of-gourmet-burger-with-ramen-noodle-layer-beef-patty-and-glazed-teriyaki-sauce-isolated-on-transparent-background-png.png',
        categoryId: burgerCategory.id,
        tags: ['Burger', 'Special', 'Sweet'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Double Cheese Delight',
        description: 'Premium burger with double melted cheddar cheese, crispy chicken, pickles, and special cheese sauce.',
        price: 6.99,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0u5UCBVMOZAgXCAXJ68TddkSyHy_6wr4XOQ&s',
        categoryId: burgerCategory.id,
        tags: ['Burger', 'Cheese', 'Best Seller', 'Premium'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Spicy Firecracker Burger',
        description: 'Spicy chicken fillet with jalapeños, pepper jack cheese, and chipotle mayo. Warning: Seriously hot!',
        price: 6.99,
        image: 'https://www.burgerandsauce.com/wp-content/uploads/2021/11/burger-and-sauce-firecracker-burger-thumb-1024x1024.png',
        categoryId: burgerCategory.id,
        tags: ['Burger', 'Spicy', 'Premium', 'Hot'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'BBQ Bacon Burger',
        description: 'Smoky BBQ chicken with crispy bacon strips, onion rings, and tangy BBQ sauce on a premium bun.',
        price: 7.49,
        image: 'https://res.cloudinary.com/dbq5ulk6b/image/upload/v1766332332/bbq-burger_yge0cr.png',
        categoryId: burgerCategory.id,
        tags: ['Burger', 'Premium', 'BBQ', 'Bacon'],
        isAvailable: true,
        isActive: true,
      },

      // Sides - Perfect Companions
      {
        name: 'Regular Fries',
        description: 'Golden, crispy French fries seasoned with sea salt. The perfect companion to any meal.',
        price: 2.99,
        image: 'https://static.tossdown.com/images/b7dae03c-a1aa-4f44-8309-87b106db623c.webp',
        categoryId: sideCategory.id,
        tags: ['Side', 'Popular', 'Classic'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Large Fries',
        description: 'Extra large portion of our famous crispy fries. Great for sharing or solo snacking.',
        price: 3.99,
        image: 'https://www.cheezybites.ae/wp-content/uploads/2024/08/large-fries.png',
        categoryId: sideCategory.id,
        tags: ['Side', 'Value', 'Sharing'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Loaded Cheese Fries',
        description: 'Crispy fries smothered in melted cheddar cheese sauce, topped with crispy bacon bits and chives.',
        price: 4.49,
        image: 'https://static.vecteezy.com/system/resources/previews/055/930/252/non_2x/loaded-fries-with-chili-and-melted-cheese-on-a-free-png.png',
        categoryId: sideCategory.id,
        tags: ['Side', 'Cheese', 'Premium', 'Popular'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Onion Rings',
        description: 'Thick-cut onion rings with crispy golden batter. Served with ranch dipping sauce.',
        price: 3.49,
        image: 'https://www.pickers.com/media/sqgleshs/onion-rings-bowl.png?width=800&quality=90&v=1db3f5ede1845d0&format=webp',
        categoryId: sideCategory.id,
        tags: ['Side', 'Crispy', 'Popular'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Coleslaw',
        description: 'Fresh, creamy coleslaw made daily with crisp cabbage, carrots, and our secret dressing.',
        price: 2.49,
        image: 'https://www.elpolloloco.com/contentAsset/image/96355606e233ee0237b069158dda1f6d/fileAsset/$fileName',
        categoryId: sideCategory.id,
        tags: ['Side', 'Fresh', 'Healthy'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Mashed Potatoes & Gravy',
        description: 'Creamy mashed potatoes topped with rich, savory brown gravy. Pure comfort food.',
        price: 3.49,
        image: 'https://www.mypizzaheaven.com/wp-content/uploads/2024/08/Mashed-Potatoes-And-Gravy-Small.png',
        categoryId: sideCategory.id,
        tags: ['Side', 'Comfort', 'Popular'],
        isAvailable: true,
        isActive: true,
      },

      // Drinks - Refreshing Beverages
      {
        name: 'Pepsi',
        description: 'Ice-cold Pepsi cola served in a medium cup with ice. The perfect thirst quencher.',
        price: 1.99,
        image: 'https://benbymart.com/cdn/shop/products/PEP15A_1024x1024.png?v=1670859281',
        categoryId: drinkCategory.id,
        tags: ['Drink', 'Cold', 'Popular'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: '7Up',
        description: 'Crisp, refreshing 7Up lemon-lime soda. Light and bubbly refreshment.',
        price: 1.99,
        image: 'https://product.hstatic.net/1000301274/product/_10100996__7up_320ml_sleek_lon_0366766c074a4b538595ed8d91dc6b0d_1024x1024.png',
        categoryId: drinkCategory.id,
        tags: ['Drink', 'Cold', 'Citrus'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Mountain Dew',
        description: 'Bold citrus flavor with an energizing boost. Perfect for adventure seekers.',
        price: 1.99,
        image: 'https://www.bbassets.com/media/uploads/p/l/40195155_3-mountain-dew-soft-drink.jpg',
        categoryId: drinkCategory.id,
        tags: ['Drink', 'Cold', 'Energy'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Iced Tea (Sweet)',
        description: 'Freshly brewed sweet tea served over ice. A Southern classic.',
        price: 1.99,
        image: 'https://www.peets.com/cdn/shop/files/iced-tea-lemonade-1266x1492.png?v=1686108258',
        categoryId: drinkCategory.id,
        tags: ['Drink', 'Cold', 'Tea'],
        isAvailable: true,
        isActive: true,
      },
      {
        name: 'Bottled Water',
        description: 'Pure spring water. Stay hydrated the healthy way.',
        price: 1.49,
        image: 'https://product.hstatic.net/1000301274/product/_10100995__nuoc_suoi_aquafina_500ml_chai_23249e397601447daa01bfa350fa66c1.png',
        categoryId: drinkCategory.id,
        tags: ['Drink', 'Healthy', 'Natural'],
        isAvailable: true,
        isActive: true,
      },
    ],
  });

  console.log(`✅ Created ${menuItems.count} menu items successfully!`);

  // Enrich menu items with kitchen metadata
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

  // Create customers using Faker
  const customersData = Array.from({ length: 20 }, () => ({
    name: faker.person.fullName(),
    phone: faker.helpers.fromRegExp('09[0-9]{8}'),
    email: faker.internet.email().toLowerCase(),
    isActive: true,
  }));

  const customers = await prisma.customer.createMany({
    data: customersData,
  });

  console.log(`✅ Created ${customers.count} customers successfully!`);

  // ========== CREATE REALISTIC TRANSACTIONAL DATA ==========
  console.log('\n💰 Creating orders, payments, and sessions...');

  // Get all menu items for order creation
  const allMenuItems = await prisma.menuItem.findMany({
    where: { isActive: true, isAvailable: true },
  });
  const allTables = await prisma.table.findMany();
  const allCustomers = await prisma.customer.findMany();

  // Helper function to get random items from array using Faker
  function randomItems<T>(array: T[], count: number): T[] {
    return faker.helpers.arrayElements(array, count);
  }

  // Helper function to set specific hour for date
  function setHour(date: Date, hour: number): Date {
    const newDate = new Date(date);
    newDate.setHours(hour, faker.number.int({ min: 0, max: 59 }), 0, 0);
    return newDate;
  }

  // Generate data from last 2 months to today
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 2);

  let totalOrders = 0;
  let totalRevenue = 0;

  console.log(`Generating orders from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}...`);

  // Batch arrays for bulk inserts
  const allSessions: any[] = [];
  const allOrders: any[] = [];
  const allOrderItems: any[] = [];
  const allPayments: any[] = [];

  // Generate 5-15 orders per day
  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const ordersPerDay = isWeekend
      ? faker.number.int({ min: 8, max: 12 }) // 8-12 orders on weekends
      : faker.number.int({ min: 5, max: 8 }); // 5-8 orders on weekdays

    for (let i = 0; i < ordersPerDay; i++) {
      // Distribute orders throughout operating hours
      const hour = faker.datatype.boolean(0.7)
        ? faker.datatype.boolean(0.5)
          ? faker.number.int({ min: 12, max: 14 }) // Lunch peak
          : faker.number.int({ min: 18, max: 21 }) // Dinner peak
        : faker.number.int({ min: 10, max: 21 }); // Other hours

      const orderTime = setHour(new Date(date), hour);
      const orderType = faker.datatype.boolean(0.6) ? 'DINE_IN' : 'TAKE_AWAY';

      // Prepare session for dine-in orders
      let sessionId: string | undefined;
      if (orderType === 'DINE_IN') {
        const table = faker.helpers.arrayElement(allTables);
        const sessionDuration = faker.number.int({ min: 30, max: 120 });
        sessionId = faker.string.uuid();

        const sessionEndTime = new Date(orderTime.getTime() + sessionDuration * 60000);
        const sessionExpiresAt = new Date(sessionEndTime.getTime() + 24 * 60 * 60 * 1000); // Expires 24 hours after end time

        allSessions.push({
          id: sessionId,
          tableId: table.id,
          startTime: orderTime,
          endTime: sessionEndTime,
          expiresAt: sessionExpiresAt,
          status: 'CLOSED' as const,
          customerCount: faker.number.int({ min: 1, max: table.capacity }),
          createdAt: orderTime,
          updatedAt: orderTime,
        });
      }

      // Random customer
      const hasCustomer = faker.datatype.boolean(0.7);
      const customer = hasCustomer
        ? faker.helpers.arrayElement(allCustomers)
        : null;

      // Prepare order
      const orderId = faker.string.uuid();
      allOrders.push({
        id: orderId,
        orderType: orderType as 'DINE_IN' | 'TAKE_AWAY',
        status: 'PAID' as const,
        sessionId,
        customerName: customer?.name,
        customerPhone: customer?.phone,
        createdAt: orderTime,
        updatedAt: orderTime,
      });

      // Add items to order
      const itemCount = faker.number.int({ min: 1, max: 5 });
      const selectedItems = randomItems(allMenuItems, itemCount);

      let orderTotal = 0;
      for (const item of selectedItems) {
        const quantity = faker.number.int({ min: 1, max: 3 });
        const itemTotal = Number(item.price) * quantity;
        orderTotal += itemTotal;

        const cookingTime = faker.number.int({ min: 5, max: 20 });
        const servingTime = cookingTime + faker.number.int({ min: 0, max: 5 });

        allOrderItems.push({
          orderId,
          menuItemId: item.id,
          quantity,
          priceAtOrder: item.price,
          itemNameAtOrder: item.name,
          status: 'SERVED' as const,
          cookingStartedAt: new Date(orderTime.getTime() + 2 * 60000),
          readyAt: new Date(orderTime.getTime() + cookingTime * 60000),
          servedAt: new Date(orderTime.getTime() + servingTime * 60000),
          createdAt: orderTime,
        });
      }

      // Calculate payment
      const subTotal = orderTotal;
      const tax = subTotal * 0.1;
      const discount = faker.datatype.boolean(0.15) ? subTotal * 0.1 : 0;
      const totalAmount = subTotal + tax - discount;

      const paymentMethod = faker.helpers.weightedArrayElement([
        { weight: 40, value: 'CASH' },
        { weight: 35, value: 'BANKING' },
        { weight: 25, value: 'CARD' },
      ]);

      const paymentTime = new Date(
        orderTime.getTime() + (sessionId ? 45 : 5) * 60000,
      );

      allPayments.push({
        orderId,
        sessionId,
        totalAmount,
        subTotal,
        tax,
        discount,
        paymentMethod: paymentMethod as 'CASH' | 'BANKING' | 'CARD',
        status: 'SUCCESS' as const,
        transactionId: `TX${Array.from({ length: 10 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 33)]).join('')}`,
        paymentTime,
        createdAt: orderTime,
      });

      totalOrders++;
      totalRevenue += totalAmount;
    }
  }

  // Batch insert all data
  console.log(`\nInserting ${allSessions.length} sessions...`);
  if (allSessions.length > 0) {
    await prisma.tableSession.createMany({ data: allSessions });
  }

  console.log(`Inserting ${allOrders.length} orders...`);
  await prisma.order.createMany({ data: allOrders });

  console.log(`Inserting ${allOrderItems.length} order items...`);
  await prisma.orderItem.createMany({ data: allOrderItems });

  console.log(`Inserting ${allPayments.length} payments...`);
  await prisma.payment.createMany({ data: allPayments });

  console.log(
    `✅ Created ${totalOrders} orders with $${totalRevenue.toFixed(2)} total revenue!`,
  );

  // ========== CREATE RESERVATIONS ==========
  console.log('\n📅 Creating reservations...');

  const allReservations: any[] = [];
  
  // Create reservations for the next 30 days
  const reservationStartDate = new Date();
  const reservationEndDate = new Date();
  reservationEndDate.setDate(reservationEndDate.getDate() + 30);

  for (
    let date = new Date(reservationStartDate);
    date <= reservationEndDate;
    date.setDate(date.getDate() + 1)
  ) {
    // Skip past dates
    if (date < new Date()) {
      continue;
    }

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const reservationsPerDay = isWeekend
      ? faker.number.int({ min: 2, max: 4 }) // 2-4 reservations on weekends
      : faker.number.int({ min: 1, max: 2 }); // 1-2 reservations on weekdays

    for (let i = 0; i < reservationsPerDay; i++) {
      // Reservation times: lunch (11-13) or dinner (17-20)
      const isLunch = faker.datatype.boolean(0.4);
      const hour = isLunch
        ? faker.number.int({ min: 11, max: 13 })
        : faker.number.int({ min: 17, max: 20 });

      const reservationTime = new Date(date);
      reservationTime.setHours(hour, faker.number.int({ min: 0, max: 59 }), 0, 0);

      // Only create future reservations
      if (reservationTime <= new Date()) {
        continue;
      }

      const table = faker.helpers.arrayElement(allTables);
      const partySize = faker.number.int({ min: 2, max: table.capacity }); // 2 to table capacity

      // 70% chance of having customer info
      const hasCustomer = faker.datatype.boolean(0.7);
      const customer = hasCustomer
        ? faker.helpers.arrayElement(allCustomers)
        : null;

      // Determine status based on time - weighted selection
      const status = faker.helpers.weightedArrayElement([
        { weight: 70, value: 'CONFIRMED' as const },
        { weight: 20, value: 'PENDING' as const },
        { weight: 10, value: 'CANCELLED' as const },
      ]);

      const notes = faker.datatype.boolean(0.3)
        ? faker.helpers.arrayElement([
            'Window seat preferred',
            'Birthday celebration',
            'Anniversary dinner',
            'Business meeting',
            'Allergic to peanuts',
            'Vegetarian menu required',
            'High chair needed',
            'Wheelchair accessible needed',
            'Quiet area preferred',
            'Special occasion',
          ])
        : null;

      allReservations.push({
        id: faker.string.uuid(),
        reservationTime,
        partySize,
        status,
        notes,
        guestName: customer?.name || faker.person.fullName(),
        guestPhone: customer?.phone || faker.helpers.fromRegExp('09[0-9]{8}'),
        customerId: customer?.id,
        tableId: table.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  console.log(`Inserting ${allReservations.length} reservations...`);
  if (allReservations.length > 0) {
    await prisma.reservation.createMany({ data: allReservations });
  }

  console.log(`✅ Created ${allReservations.length} reservations for the next 30 days!`);

  console.log('\n✨ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error('❌ Error during seeding:', errorMessage);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('👋 Database connection closed');
  });
