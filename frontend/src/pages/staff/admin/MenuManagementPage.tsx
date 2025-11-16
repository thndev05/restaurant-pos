import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Edit, Eye, EyeOff, Trash2 } from 'lucide-react';

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  tags?: string[];
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

const categories: Category[] = [
  { id: 'all', name: 'All', icon: '🍽️' },
  { id: '2', name: 'Appetizers', icon: '🥗' },
  { id: '3', name: 'Main Course', icon: '🍖' },
  { id: '4', name: 'Desserts', icon: '🍰' },
  { id: '5', name: 'Beverages', icon: '🥤' },
];

export default function MenuManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: '1',
      categoryId: '3',
      name: 'Beef Steak',
      description: 'Grilled beef steak with vegetables and black pepper sauce',
      price: 250000,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      isAvailable: true,
      tags: ['Best Seller', 'Spicy'],
    },
    {
      id: '2',
      categoryId: '3',
      name: 'Grilled Salmon',
      description: 'Fresh salmon grilled to perfection with lemon butter sauce',
      price: 280000,
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
      isAvailable: true,
      tags: ['Healthy'],
    },
    {
      id: '3',
      categoryId: '2',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with caesar dressing and croutons',
      price: 120000,
      imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
      isAvailable: true,
      tags: ['Vegetarian'],
    },
    {
      id: '4',
      categoryId: '3',
      name: 'Margherita Pizza',
      description: 'Classic Italian pizza with tomato, mozzarella and basil',
      price: 180000,
      imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
      isAvailable: false,
      tags: ['Vegetarian'],
    },
    {
      id: '5',
      categoryId: '5',
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed orange juice',
      price: 45000,
      imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop',
      isAvailable: true,
      tags: ['Healthy'],
    },
    {
      id: '6',
      categoryId: '4',
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with molten center served with vanilla ice cream',
      price: 85000,
      imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop',
      isAvailable: true,
      tags: ['Best Seller'],
    },
    {
      id: '7',
      categoryId: '2',
      name: 'Bruschetta',
      description: 'Toasted bread topped with fresh tomatoes, garlic, and basil',
      price: 95000,
      imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop',
      isAvailable: true,
      tags: ['Vegetarian'],
    },
    {
      id: '8',
      categoryId: '3',
      name: 'Chicken Parmesan',
      description: 'Breaded chicken breast with marinara sauce and melted cheese',
      price: 210000,
      imageUrl: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&h=300&fit=crop',
      isAvailable: true,
      tags: ['Best Seller'],
    },
  ]);

  const handleToggleAvailability = (itemId: string) => {
    setMenuItems((items) =>
      items.map((item) => (item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item))
    );
  };

  const handleDelete = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setMenuItems((items) => items.filter((item) => item.id !== itemId));
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Menu Management</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage your restaurant menu items and categories
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex w-full flex-wrap justify-start gap-1">
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="text-xs sm:text-sm">
              <span className="mr-1 sm:mr-2">{cat.icon}</span>
              <span className="hidden sm:inline">{cat.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4 sm:mt-6">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-40 w-full object-cover sm:h-48"
                  />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Badge variant="destructive" className="text-sm sm:text-lg">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-1 text-base font-bold sm:text-lg">{item.name}</h3>
                      <span className="text-primary shrink-0 text-base font-bold sm:text-lg">
                        ${(item.price / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 text-xs sm:text-sm">
                      {item.description}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 px-2 text-xs sm:px-3 sm:text-sm"
                        onClick={() => handleToggleAvailability(item.id)}
                      >
                        {item.isAvailable ? (
                          <>
                            <EyeOff className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Hide</span>
                          </>
                        ) : (
                          <>
                            <Eye className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Show</span>
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm" className="px-2 sm:px-3">
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-2 sm:px-3"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
