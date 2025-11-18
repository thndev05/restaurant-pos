import { PrismaClient, RoleName } from '../src/generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear old data in correct order
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
    { name: 'menu-items.create', description: 'Create menu items', resource: 'menu-items', action: 'create' },
    { name: 'menu-items.read', description: 'View menu items', resource: 'menu-items', action: 'read' },
    { name: 'menu-items.update', description: 'Update menu items', resource: 'menu-items', action: 'update' },
    { name: 'menu-items.delete', description: 'Delete menu items', resource: 'menu-items', action: 'delete' },
    
    // Categories permissions
    { name: 'categories.create', description: 'Create categories', resource: 'categories', action: 'create' },
    { name: 'categories.read', description: 'View categories', resource: 'categories', action: 'read' },
    { name: 'categories.update', description: 'Update categories', resource: 'categories', action: 'update' },
    { name: 'categories.delete', description: 'Delete categories', resource: 'categories', action: 'delete' },
    
    // Tables permissions
    { name: 'tables.create', description: 'Create tables', resource: 'tables', action: 'create' },
    { name: 'tables.read', description: 'View tables', resource: 'tables', action: 'read' },
    { name: 'tables.update', description: 'Update table status', resource: 'tables', action: 'update' },
    { name: 'tables.delete', description: 'Delete tables', resource: 'tables', action: 'delete' },
    
    // Customers permissions
    { name: 'customers.create', description: 'Create customers', resource: 'customers', action: 'create' },
    { name: 'customers.read', description: 'View customers', resource: 'customers', action: 'read' },
    { name: 'customers.update', description: 'Update customers', resource: 'customers', action: 'update' },
    { name: 'customers.delete', description: 'Delete customers', resource: 'customers', action: 'delete' },
    
    // Orders permissions
    { name: 'orders.create', description: 'Create orders', resource: 'orders', action: 'create' },
    { name: 'orders.read', description: 'View orders', resource: 'orders', action: 'read' },
    { name: 'orders.update', description: 'Update orders', resource: 'orders', action: 'update' },
    { name: 'orders.delete', description: 'Delete orders', resource: 'orders', action: 'delete' },
    { name: 'orders.cancel', description: 'Cancel orders', resource: 'orders', action: 'cancel' },
    
    // Users permissions
    { name: 'users.create', description: 'Create users', resource: 'users', action: 'create' },
    { name: 'users.read', description: 'View users', resource: 'users', action: 'read' },
    { name: 'users.update', description: 'Update users', resource: 'users', action: 'update' },
    { name: 'users.delete', description: 'Delete users', resource: 'users', action: 'delete' },
    
    // Roles permissions
    { name: 'roles.create', description: 'Create roles', resource: 'roles', action: 'create' },
    { name: 'roles.read', description: 'View roles', resource: 'roles', action: 'read' },
    { name: 'roles.update', description: 'Update roles', resource: 'roles', action: 'update' },
    { name: 'roles.delete', description: 'Delete roles', resource: 'roles', action: 'delete' },
    
    // Reports permissions
    { name: 'reports.view', description: 'View reports', resource: 'reports', action: 'read' },
    { name: 'reports.export', description: 'Export reports', resource: 'reports', action: 'export' },
    
    // Kitchen permissions
    { name: 'kitchen.view-orders', description: 'View kitchen orders', resource: 'kitchen', action: 'read' },
    { name: 'kitchen.update-status', description: 'Update order cooking status', resource: 'kitchen', action: 'update' },
    
    // Payment permissions
    { name: 'payments.process', description: 'Process payments', resource: 'payments', action: 'create' },
    { name: 'payments.refund', description: 'Refund payments', resource: 'payments', action: 'refund' },
  ];

  const createdPermissions = await Promise.all(
    permissions.map(p => prisma.permission.create({ data: p }))
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
  const allPermissionIds = createdPermissions.map(p => p.id);
  await Promise.all(
    allPermissionIds.map(permissionId =>
      prisma.rolePermission.create({
        data: { roleId: adminRole.id, permissionId },
      })
    )
  );
  console.log(`✅ Admin: ${allPermissionIds.length} permissions`);

  // Manager: Most permissions except user/role management
  const managerPermissionNames = [
    'menu-items.create', 'menu-items.read', 'menu-items.update', 'menu-items.delete',
    'categories.create', 'categories.read', 'categories.update', 'categories.delete',
    'tables.create', 'tables.read', 'tables.update', 'tables.delete',
    'customers.create', 'customers.read', 'customers.update', 'customers.delete',
    'orders.create', 'orders.read', 'orders.update', 'orders.delete', 'orders.cancel',
    'users.read',
    'reports.view', 'reports.export',
    'payments.process', 'payments.refund',
  ];
  const managerPermissions = createdPermissions.filter(p => managerPermissionNames.includes(p.name));
  await Promise.all(
    managerPermissions.map(p =>
      prisma.rolePermission.create({
        data: { roleId: managerRole.id, permissionId: p.id },
      })
    )
  );
  console.log(`✅ Manager: ${managerPermissions.length} permissions`);

  // Cashier: Orders, payments, customers, view menu
  const cashierPermissionNames = [
    'menu-items.read',
    'categories.read',
    'tables.read', 'tables.update',
    'customers.create', 'customers.read', 'customers.update',
    'orders.create', 'orders.read', 'orders.update',
    'payments.process', 'payments.refund',
  ];
  const cashierPermissions = createdPermissions.filter(p => cashierPermissionNames.includes(p.name));
  await Promise.all(
    cashierPermissions.map(p =>
      prisma.rolePermission.create({
        data: { roleId: cashierRole.id, permissionId: p.id },
      })
    )
  );
  console.log(`✅ Cashier: ${cashierPermissions.length} permissions`);

  // Waiter: Tables, orders, view menu and customers
  const waiterPermissionNames = [
    'menu-items.read',
    'categories.read',
    'tables.read', 'tables.update',
    'customers.read',
    'orders.create', 'orders.read', 'orders.update',
  ];
  const waiterPermissions = createdPermissions.filter(p => waiterPermissionNames.includes(p.name));
  await Promise.all(
    waiterPermissions.map(p =>
      prisma.rolePermission.create({
        data: { roleId: waiterRole.id, permissionId: p.id },
      })
    )
  );
  console.log(`✅ Waiter: ${waiterPermissions.length} permissions`);

  // Kitchen: View orders and update cooking status
  const kitchenPermissionNames = [
    'menu-items.read',
    'orders.read',
    'kitchen.view-orders', 'kitchen.update-status',
  ];
  const kitchenPermissions = createdPermissions.filter(p => kitchenPermissionNames.includes(p.name));
  await Promise.all(
    kitchenPermissions.map(p =>
      prisma.rolePermission.create({
        data: { roleId: kitchenRole.id, permissionId: p.id },
      })
    )
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

  console.log('✅ Created 8 users (1 admin, 1 manager, 2 cashiers, 2 waiters, 2 kitchen staff)');
  console.log('   Login credentials:');
  console.log('   - admin/admin123');
  console.log('   - manager/manager123');
  console.log('   - cashier1/cashier123, cashier2/cashier123');
  console.log('   - waiter1/waiter123, waiter2/waiter123');
  console.log('   - kitchen1/kitchen123, kitchen2/kitchen123');

  console.log('\n🍽️  Creating restaurant data...');

  // Tạo categories
  const comboCategory = await prisma.category.create({
    data: { name: 'Combo', isActive: true },
  });
  const friedChickenCategory = await prisma.category.create({
    data: { name: 'Fried Chicken', isActive: true },
  });
  const burgerCategory = await prisma.category.create({
    data: { name: 'Burger', isActive: true },
  });
  const sideCategory = await prisma.category.create({
    data: { name: 'Side', isActive: true },
  });
  const drinkCategory = await prisma.category.create({
    data: { name: 'Drink', isActive: true },
  });

  console.log('✅ Created 5 categories successfully!');

  // Create sample menu items
  const menuItems = await prisma.menuItem.createMany({
    data: [
      // 🍗 Combo
      {
        name: 'Combo 1 Miếng Gà + Pepsi',
        price: 45000,
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec',
        categoryId: comboCategory.id,
        isActive: true,
      },
      {
        name: 'Combo 2 Miếng Gà + Khoai Tây + Pepsi',
        price: 85000,
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710',
        categoryId: comboCategory.id,
        isActive: true,
      },
      {
        name: 'Combo 3 Miếng Gà + 2 Khoai Tây + 2 Pepsi',
        price: 125000,
        image: 'https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0',
        categoryId: comboCategory.id,
        isActive: true,
      },
      {
        name: 'Combo Gia Đình (6 Miếng Gà + 3 Khoai + 4 Pepsi)',
        price: 249000,
        image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec',
        categoryId: comboCategory.id,
        isActive: true,
      },
      {
        name: 'Combo Tiệc Tùng (9 Miếng Gà + 4 Khoai + 6 Pepsi)',
        price: 359000,
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec',
        categoryId: comboCategory.id,
        isActive: true,
      },

      // 🍗 Fried Chicken
      {
        name: 'Gà Rán Giòn Cay (1 Miếng)',
        price: 38000,
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710',
        categoryId: friedChickenCategory.id,
        isActive: true,
      },
      {
        name: 'Gà Rán Truyền Thống (1 Miếng)',
        price: 35000,
        image: 'https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0',
        categoryId: friedChickenCategory.id,
        isActive: true,
      },
      {
        name: 'Gà Rán Không Xương (3 Miếng)',
        price: 45000,
        image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec',
        categoryId: friedChickenCategory.id,
        isActive: true,
      },
      {
        name: 'Gà Rán Giòn Cay (2 Miếng)',
        price: 72000,
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec',
        categoryId: friedChickenCategory.id,
        isActive: true,
      },
      {
        name: 'Gà Rán Truyền Thống (3 Miếng)',
        price: 99000,
        categoryId: friedChickenCategory.id,
        isActive: true,
      },

      // 🍔 Burgers
      {
        name: 'Burger Gà Giòn',
        price: 42000,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
        categoryId: burgerCategory.id,
        isActive: true,
      },
      {
        name: 'Burger Gà Teriyaki',
        price: 45000,
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
        categoryId: burgerCategory.id,
        isActive: true,
      },
      {
        name: 'Burger Gà Phô Mai',
        price: 48000,
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add',
        categoryId: burgerCategory.id,
        isActive: true,
      },
      {
        name: 'Burger Gà Cay Đặc Biệt',
        price: 52000,
        image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9',
        categoryId: burgerCategory.id,
        isActive: true,
      },

      // 🍟 Sides
      {
        name: 'Khoai Tây Chiên (Vừa)',
        price: 25000,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877',
        categoryId: sideCategory.id,
        isActive: true,
      },
      {
        name: 'Khoai Tây Chiên (Lớn)',
        price: 35000,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877',
        categoryId: sideCategory.id,
        isActive: true,
      },
      {
        name: 'Khoai Tây Lắc Phô Mai',
        price: 32000,
        categoryId: sideCategory.id,
        isActive: true,
      },

      // 🥤 Drinks
      {
        name: 'Pepsi (Lon)',
        price: 15000,
        image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e',
        categoryId: drinkCategory.id,
        isActive: true,
      },
      {
        name: 'Pepsi (Ly)',
        price: 12000,
        categoryId: drinkCategory.id,
        isActive: true,
      },
      {
        name: '7Up (Lon)',
        price: 15000,
        categoryId: drinkCategory.id,
        isActive: true,
      },
      {
        name: 'Mirinda (Lon)',
        price: 15000,
        categoryId: drinkCategory.id,
        isActive: true,
      },
      {
        name: 'Nước Suối',
        price: 10000,
        categoryId: drinkCategory.id,
        isActive: true,
      },

      // ❌ Inactive Items
      {
        name: 'Gà Sốt Phô Mai (Ngưng Bán)',
        price: 55000,
        categoryId: friedChickenCategory.id,
        isActive: false,
      },
      {
        name: 'Burger Gà Bơ Tỏi (Ngưng Bán)',
        price: 49000,
        categoryId: burgerCategory.id,
        isActive: false,
      },
    ],
  });

  console.log(`✅ Đã tạo ${menuItems.count} menu items thành công!`);

  // Tạo tables
  const tables = await prisma.table.createMany({
    data: [
      { number: 1, capacity: 2 },
      { number: 2, capacity: 2 },
      { number: 3, capacity: 4 },
      { number: 4, capacity: 4 },
      { number: 5, capacity: 6 },
      { number: 6, capacity: 6 },
      { number: 7, capacity: 8 },
      { number: 8, capacity: 8 },
    ],
  });

  console.log(`✅ Đã tạo ${tables.count} tables thành công!`);

  // Tạo customers
  const customers = await prisma.customer.createMany({
    data: [
      { name: 'Nguyễn Văn A', phone: '0901234567', isActive: true },
      { name: 'Trần Thị B', phone: '0912345678', isActive: true },
      { name: 'Phạm Minh C', phone: '0923456789', isActive: true },
      { name: 'Lê Quốc D', phone: '0934567890', isActive: true },
      { name: 'Hoàng Kim E', phone: '0945678901', isActive: true },
      { name: 'Vũ Hải F', phone: '0956789012', isActive: true },
      { name: 'Đặng Ngọc G', phone: '0967890123', isActive: true },
      { name: 'Bùi Tuấn H', phone: '0978901234', isActive: true },
      { name: 'Tô Công I', phone: '0989012345', isActive: true },
      { name: 'Mạc Thị J', phone: '0990123456', isActive: true },
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
