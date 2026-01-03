import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, UtensilsCrossed, AlertCircle, User } from 'lucide-react';

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="w-full max-w-md">
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

        <Card>
          <CardHeader className="space-y-1 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12">
                <User className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl">Staff Login</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Enter your credentials to continue
                </CardDescription>
              </div>
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
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
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
                For customers: <span className="font-medium">Scan QR code on your table</span> to
                order
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
