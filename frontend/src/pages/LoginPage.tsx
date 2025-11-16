import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUsers, FiUser, FiShield } from 'react-icons/fi';
import { Button, Input } from '../components/common';

const LoginPage: FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'admin' | 'staff' | 'customer'>('staff');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate based on selected role
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'staff') {
        navigate('/staff/home');
      } else {
        navigate('/customer/home');
      }
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#667eea] to-[#764ba2] p-5">
      <div className="w-full max-w-md">
        <div className="animate-slideUp rounded-2xl bg-white p-10 shadow-2xl">
          {/* Logo */}
          <div className="mb-10 flex flex-col items-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-xl bg-linear-to-br from-[#667eea] to-[#764ba2] text-4xl text-white">
              🍽️
            </div>
            <h1 className="text-text-dark mb-2 text-3xl font-bold">Welcome Back</h1>
            <p className="text-text-gray text-sm">Sign in to continue to Restaurant POS</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="text-text-gray mb-2 block text-sm font-medium">Login as</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-medium transition-all ${
                    role === 'admin'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-text-gray hover:border-primary/50'
                  }`}
                >
                  <FiShield size={20} />
                  <span>Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('staff')}
                  className={`flex items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-medium transition-all ${
                    role === 'staff'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-text-gray hover:border-primary/50'
                  }`}
                >
                  <FiUsers size={20} />
                  <span>Staff</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`flex items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-medium transition-all ${
                    role === 'customer'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-text-gray hover:border-primary/50'
                  }`}
                >
                  <FiUser size={20} />
                  <span>Customer</span>
                </button>
              </div>
            </div>

            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<FiMail size={20} />}
              fullWidth
              required
            />

            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<FiLock size={20} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-text-gray hover:text-text-dark"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              }
              fullWidth
              required
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
                />
                <span className="text-text-gray text-sm">Remember me</span>
              </label>
              <button
                type="button"
                className="text-primary hover:text-primary-hover text-sm font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-8 text-center">
            <p className="text-text-gray text-sm">
              Don't have an account?{' '}
              <button className="text-primary hover:text-primary-hover font-medium">Sign up</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
