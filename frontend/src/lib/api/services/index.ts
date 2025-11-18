/**
 * API Services Index
 * Central export point for all API services
 */

// Export services
export { authService } from './auth.service';
export { usersService } from './users.service';
export { categoriesService } from './categories.service';
export { menuItemsService } from './menu-items.service';
export { tablesService } from './tables.service';
export { customersService } from './customers.service';

// Export types from auth service (User type is exported here explicitly)
export type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User as AuthUser,
} from './auth.service';

// Export types from users service
export type { User, CreateUserData, UpdateUserData } from './users.service';

// Export types from categories service
export type { Category, CreateCategoryData, UpdateCategoryData } from './categories.service';

// Export types from menu items service
export type { MenuItem, CreateMenuItemData, UpdateMenuItemData } from './menu-items.service';

// Export types from tables service
export type { Table, CreateTableData, UpdateTableData } from './tables.service';

// Export types from customers service
export type { Customer, CreateCustomerData, UpdateCustomerData } from './customers.service';
