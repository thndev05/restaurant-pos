import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Edit, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { menuItemsService, type MenuItem } from '@/lib/api/services/menuItems.service';
import { categoriesService, type Category } from '@/lib/api/services/categories.service';
import { MenuItemDialog, type MenuItemFormData } from '@/components/menu/MenuItemDialog';
import { useToast } from '@/hooks/use-toast';

export default function MenuManagementPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<MenuItem | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [itemsData, categoriesData] = await Promise.all([
        menuItemsService.getMenuItems(),
        categoriesService.getCategories(),
      ]);
      setMenuItems(itemsData);
      setCategories(categoriesData.filter((cat: Category) => cat.isActive));
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load menu data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateItem = async (data: MenuItemFormData) => {
    try {
      await menuItemsService.createMenuItem(data);
      toast({
        title: 'Success',
        description: 'Menu item created successfully',
      });
      loadData();
    } catch (error) {
      console.error('Failed to create item:', error);
      toast({
        title: 'Error',
        description: 'Failed to create menu item',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleEditItem = async (data: MenuItemFormData) => {
    if (!selectedItem) return;
    try {
      await menuItemsService.updateMenuItem(selectedItem.id, data);
      toast({
        title: 'Success',
        description: 'Menu item updated successfully',
      });
      loadData();
    } catch (error) {
      console.error('Failed to update item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update menu item',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    try {
      await menuItemsService.toggleAvailability(itemId);
      toast({
        title: 'Success',
        description: 'Menu item availability updated',
      });
      loadData();
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await menuItemsService.softDeleteMenuItem(itemToDelete);
      toast({
        title: 'Success',
        description: 'Menu item deleted successfully',
      });
      loadData();
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete menu item',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const openCreateDialog = () => {
    setSelectedItem(undefined);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const openEditDialog = (item: MenuItem) => {
    setSelectedItem(item);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const openDeleteDialog = (itemId: string) => {
    setItemToDelete(itemId);
    setDeleteDialogOpen(true);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory && item.isActive;
  });

  const categoryTabs = [
    { id: 'all', name: 'All Items' },
    ...categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
    })),
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

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
        <Button className="w-full sm:w-auto" onClick={openCreateDialog}>
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
        <div className="border-b">
          <TabsList className="inline-flex h-auto w-full justify-start gap-1 rounded-none border-0 bg-transparent p-0">
            {categoryTabs.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-sm font-medium shadow-none transition-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                {cat.name}
                {selectedCategory === cat.id && (
                  <span className="bg-primary absolute inset-x-0 bottom-0 h-0.5" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={selectedCategory} className="mt-4 sm:mt-6">
          {filteredItems.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <p className="text-muted-foreground">No menu items found</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="relative">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-40 w-full object-cover sm:h-48"
                      />
                    ) : (
                      <div className="bg-muted flex h-40 w-full items-center justify-center sm:h-48">
                        <span className="text-muted-foreground text-sm">No image</span>
                      </div>
                    )}
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
                          ${Number(item.price).toFixed(2)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-muted-foreground line-clamp-2 text-xs sm:text-sm">
                          {item.description}
                        </p>
                      )}
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category.name}
                        </Badge>
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 sm:px-3"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 sm:px-3"
                          onClick={() => openDeleteDialog(item.id)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <MenuItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={dialogMode === 'create' ? handleCreateItem : handleEditItem}
        categories={categories}
        initialData={selectedItem}
        mode={dialogMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the menu item from the active menu. You can restore it later if
              needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
