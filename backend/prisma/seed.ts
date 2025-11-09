import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seeding database...');

  // Xóa dữ liệu cũ
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  console.log('🗑️  Đã xóa dữ liệu cũ');

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

  console.log('✅ Đã tạo 5 categories thành công!');

  // Tạo dữ liệu mẫu - Món Gà Rán
  const menuItems = await prisma.menuItem.createMany({
    data: [
      // 🍗 Combo Gà Rán
      { 
        name: 'Combo 1 Miếng Gà + Pepsi', 
        price: 45000, 
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec',
        categoryId: comboCategory.id,
        isActive: true 
      },
      { 
        name: 'Combo 2 Miếng Gà + Khoai Tây + Pepsi', 
        price: 85000, 
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710',
        categoryId: comboCategory.id,
        isActive: true 
      },
      { 
        name: 'Combo 3 Miếng Gà + 2 Khoai Tây + 2 Pepsi', 
        price: 125000, 
        image: 'https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0',
        categoryId: comboCategory.id,
        isActive: true 
      },
      { 
        name: 'Combo Gia Đình (6 Miếng Gà + 3 Khoai + 4 Pepsi)', 
        price: 249000, 
        image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec',
        categoryId: comboCategory.id,
        isActive: true 
      },
      { 
        name: 'Combo Tiệc Tùng (9 Miếng Gà + 4 Khoai + 6 Pepsi)', 
        price: 359000, 
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec',
        categoryId: comboCategory.id,
        isActive: true 
      },

      // 🍗 Gà Rán Đơn
      { 
        name: 'Gà Rán Giòn Cay (1 Miếng)', 
        price: 38000, 
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710',
        categoryId: friedChickenCategory.id,
        isActive: true 
      },
      { 
        name: 'Gà Rán Truyền Thống (1 Miếng)', 
        price: 35000, 
        image: 'https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0',
        categoryId: friedChickenCategory.id,
        isActive: true 
      },
      { 
        name: 'Gà Rán Không Xương (3 Miếng)', 
        price: 45000, 
        image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec',
        categoryId: friedChickenCategory.id,
        isActive: true 
      },
      { 
        name: 'Gà Rán Giòn Cay (2 Miếng)', 
        price: 72000, 
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec',
        categoryId: friedChickenCategory.id,
        isActive: true 
      },
      { 
        name: 'Gà Rán Truyền Thống (3 Miếng)', 
        price: 99000,
        categoryId: friedChickenCategory.id,
        isActive: true 
      },

      // 🍔 Burger Gà
      { 
        name: 'Burger Gà Giòn', 
        price: 42000, 
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
        categoryId: burgerCategory.id,
        isActive: true 
      },
      { 
        name: 'Burger Gà Teriyaki', 
        price: 45000, 
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
        categoryId: burgerCategory.id,
        isActive: true 
      },
      { 
        name: 'Burger Gà Phô Mai', 
        price: 48000, 
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add',
        categoryId: burgerCategory.id,
        isActive: true 
      },
      { 
        name: 'Burger Gà Cay Đặc Biệt', 
        price: 52000, 
        image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9',
        categoryId: burgerCategory.id,
        isActive: true 
      },

      // 🍟 Món Phụ
      { 
        name: 'Khoai Tây Chiên (Vừa)', 
        price: 25000, 
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877',
        categoryId: sideCategory.id,
        isActive: true 
      },
      { 
        name: 'Khoai Tây Chiên (Lớn)', 
        price: 35000, 
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877',
        categoryId: sideCategory.id,
        isActive: true 
      },
      { 
        name: 'Khoai Tây Lắc Phô Mai', 
        price: 32000,
        categoryId: sideCategory.id,
        isActive: true 
      },

      // 🥤 Đồ Uống
      { 
        name: 'Pepsi (Lon)', 
        price: 15000, 
        image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e',
        categoryId: drinkCategory.id,
        isActive: true 
      },
      { 
        name: 'Pepsi (Ly)', 
        price: 12000,
        categoryId: drinkCategory.id,
        isActive: true 
      },
      { 
        name: '7Up (Lon)', 
        price: 15000,
        categoryId: drinkCategory.id,
        isActive: true 
      },
      { 
        name: 'Mirinda (Lon)', 
        price: 15000,
        categoryId: drinkCategory.id,
        isActive: true 
      },
      { 
        name: 'Nước Suối', 
        price: 10000,
        categoryId: drinkCategory.id,
        isActive: true 
      },

      // ❌ Món Ngưng Bán (Inactive)
      { 
        name: 'Gà Sốt Phô Mai (Ngưng Bán)', 
        price: 55000,
        categoryId: friedChickenCategory.id,
        isActive: false 
      },
      { 
        name: 'Burger Gà Bơ Tỏi (Ngưng Bán)', 
        price: 49000,
        categoryId: burgerCategory.id,
        isActive: false 
      },
    ],
  });

  console.log(`✅ Đã tạo ${menuItems.count} menu items thành công!`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('👋 Đã ngắt kết nối database');
  });