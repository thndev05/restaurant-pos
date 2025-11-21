import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Users,
  User,
  ChefHat,
  CreditCard,
  Eye,
  EyeOff,
  UtensilsCrossed,
  AlertCircle,
} from 'lucide-react';

type StaffRole = 'admin' | 'manager' | 'staff' | 'kitchen' | 'cashier';

interface RoleConfig {
  id: StaffRole;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  route: string;
}

const STAFF_ROLES: RoleConfig[] = [
  { id: 'admin', icon: Shield, label: 'Admin', color: 'destructive', route: '/staff/dashboard' },
  { id: 'manager', icon: Users, label: 'Manager', color: 'info', route: '/staff/dashboard' },
  { id: 'staff', icon: User, label: 'Staff', color: 'secondary', route: '/staff/tables' },
  { id: 'kitchen', icon: ChefHat, label: 'Kitchen', color: 'success', route: '/staff/orders' },
  { id: 'cashier', icon: CreditCard, label: 'Cashier', color: 'warning', route: '/staff/payment' },
];

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<StaffRole>('staff');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await login({
        username: formData.username,
        password: formData.password,
      });

      // Navigate based on user's module access permissions
      const permissions = user.permissions;

      if (permissions.includes('module.admin.access')) {
        navigate('/staff/admin/dashboard');
      } else if (permissions.includes('module.waiter.access')) {
        navigate('/staff/waiter/dashboard');
      } else if (permissions.includes('module.kitchen.access')) {
        navigate('/staff/kitchen/dashboard');
      } else if (permissions.includes('module.cashier.access')) {
        navigate('/staff/cashier/payments');
      } else {
        // Fallback if no module access
        navigate('/staff/admin/dashboard');
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Invalid username or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // const selectedRoleConfig = STAFF_ROLES.find((r) => r.id === selectedRole);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="w-full max-w-5xl">
        <div className="mb-6 text-center sm:mb-8">
          <div className="bg-primary/10 mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 sm:mb-4 sm:px-4 sm:py-2">
            <UtensilsCrossed className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-primary text-sm font-semibold sm:text-base">Restaurant POS</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Staff Login
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Sign in to access the staff dashboard
          </p>
        </div>

        <Tabs
          value={selectedRole}
          onValueChange={(value) => setSelectedRole(value as StaffRole)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5 gap-1">
            {STAFF_ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <TabsTrigger
                  key={role.id}
                  value={role.id}
                  className="flex flex-col items-center gap-1 px-2 py-2 sm:flex-row sm:gap-2 sm:px-4"
                >
                  <Icon className="h-4 w-4 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">{role.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {STAFF_ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <TabsContent key={role.id} value={role.id} className="mt-4 sm:mt-6">
                <Card>
                  <CardHeader className="space-y-1 p-4 sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12">
                          <Icon className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl sm:text-2xl">
                            Login as {role.label}
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm">
                            Enter your credentials to continue
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={
                          role.color as
                            | 'default'
                            | 'secondary'
                            | 'destructive'
                            | 'outline'
                            | 'success'
                            | 'warning'
                            | 'info'
                        }
                        className="w-fit shrink-0"
                      >
                        {role.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm">
                          Username
                        </Label>
                        <Input
                          id="username"
                          type="text"
                          placeholder="Enter your username"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm">
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="remember"
                            checked={formData.rememberMe}
                            onChange={(e) =>
                              setFormData({ ...formData, rememberMe: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label htmlFor="remember" className="text-sm font-normal">
                            Remember me
                          </Label>
                        </div>
                        <Button type="button" variant="link" className="p-0 text-sm">
                          Forgot password?
                        </Button>
                      </div>

                      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </form>

                    <div className="bg-muted mt-6 rounded-lg p-4">
                      <p className="text-muted-foreground text-center text-sm">
                        For customers:{' '}
                        <span className="font-medium">Scan QR code on your table</span> to order
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
