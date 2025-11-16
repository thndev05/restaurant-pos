import type { FC } from 'react';
import { useState } from 'react';
import { AdminLayout } from '../../layouts/admin';
import { Card, Button, Input, Modal, Badge } from '../../components/common';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import type { MenuItem, Category } from '../../types';

const MenuManagementPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Mock categories
  const categories: Category[] = [
    { id: '1', name: 'All', icon: '🍽️' },
    { id: '2', name: 'Appetizers', icon: '🥗' },
    { id: '3', name: 'Main Course', icon: '🍖' },
    { id: '4', name: 'Desserts', icon: '🍰' },
    { id: '5', name: 'Beverages', icon: '🥤' },
  ];

  // Mock menu items
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: '1',
      categoryId: '3',
      name: 'Beef Steak',
      description: 'Grilled beef steak with vegetables and black pepper sauce',
      price: 250000,
      imageUrl: 'https://via.placeholder.com/150',
      isAvailable: true,
      tags: ['Best Seller', 'Spicy'],
    },
    {
      id: '2',
      categoryId: '3',
      name: 'Grilled Salmon',
      description: 'Fresh salmon grilled to perfection with lemon butter sauce',
      price: 280000,
      imageUrl: 'https://via.placeholder.com/150',
      isAvailable: true,
      tags: ['Healthy'],
    },
    {
      id: '3',
      categoryId: '2',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with caesar dressing and croutons',
      price: 120000,
      imageUrl: 'https://via.placeholder.com/150',
      isAvailable: true,
      tags: ['Vegetarian'],
    },
    {
      id: '4',
      categoryId: '3',
      name: 'Margherita Pizza',
      description: 'Classic Italian pizza with tomato, mozzarella and basil',
      price: 180000,
      imageUrl: 'https://via.placeholder.com/150',
      isAvailable: false,
      tags: ['Vegetarian'],
    },
    {
      id: '5',
      categoryId: '5',
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed orange juice',
      price: 45000,
      imageUrl: 'https://via.placeholder.com/150',
      isAvailable: true,
      tags: ['Healthy'],
    },
  ]);

  const handleToggleAvailability = (itemId: string) => {
    setMenuItems((items) =>
      items.map((item) => (item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item))
    );
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setMenuItems((items) => items.filter((item) => item.id !== itemId));
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      <div className="bg-background flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-text-dark mb-2 text-3xl font-bold">Menu Management</h1>
              <p className="text-text-gray text-sm">
                Manage your restaurant menu items and categories
              </p>
            </div>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <FiPlus size={18} />
              Add New Item
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-col gap-4 md:flex-row">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="text-text-gray absolute top-1/2 left-3 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() =>
                      setSelectedCategory(category.name === 'All' ? 'all' : category.id)
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                      (selectedCategory === 'all' && category.name === 'All') ||
                      selectedCategory === category.id
                        ? 'bg-primary text-white'
                        : 'text-text-gray hover:bg-background bg-white'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative">
                  <img src={item.imageUrl} alt={item.name} className="h-48 w-full object-cover" />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Badge variant="danger" className="text-lg">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-text-dark text-lg font-bold">{item.name}</h3>
                    <span className="text-primary text-lg font-bold">
                      ${(item.price / 1000).toFixed(0)}k
                    </span>
                  </div>

                  <p className="text-text-gray mb-3 line-clamp-2 text-sm">{item.description}</p>

                  {item.tags && item.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="info" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAvailability(item.id)}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        item.isAvailable
                          ? 'bg-success/10 text-success hover:bg-success/20'
                          : 'bg-danger/10 text-danger hover:bg-danger/20'
                      }`}
                    >
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </button>

                    <button
                      onClick={() => handleEdit(item)}
                      className="text-primary hover:bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg transition-all"
                    >
                      <FiEdit2 size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-danger hover:bg-danger/10 flex h-10 w-10 items-center justify-center rounded-lg transition-all"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <Card className="py-12 text-center">
              <p className="text-text-gray text-lg">No menu items found</p>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Menu Item">
        <div className="space-y-4">
          <div>
            <label className="text-text-dark mb-2 block text-sm font-medium">Item Name</label>
            <Input type="text" placeholder="Enter item name" defaultValue={editingItem?.name} />
          </div>

          <div>
            <label className="text-text-dark mb-2 block text-sm font-medium">Description</label>
            <textarea
              className="text-text-dark border-background focus:border-primary w-full rounded-lg border bg-white px-4 py-3 transition-all outline-none"
              rows={3}
              placeholder="Enter description"
              defaultValue={editingItem?.description}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-text-dark mb-2 block text-sm font-medium">Price ($)</label>
              <Input
                type="number"
                placeholder="0.00"
                defaultValue={editingItem?.price ? editingItem.price / 1000 : ''}
              />
            </div>

            <div>
              <label className="text-text-dark mb-2 block text-sm font-medium">Category</label>
              <select
                className="text-text-dark border-background focus:border-primary w-full rounded-lg border bg-white px-4 py-3 transition-all outline-none"
                defaultValue={editingItem?.categoryId}
              >
                {categories
                  .filter((cat) => cat.name !== 'All')
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-text-dark mb-2 block text-sm font-medium">Image URL</label>
            <Input type="text" placeholder="Enter image URL" defaultValue={editingItem?.imageUrl} />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              {editingItem ? 'Update' : 'Add'} Item
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default MenuManagementPage;
