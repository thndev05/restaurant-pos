import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '@/contexts';
import { customerApi } from '@/lib/api/customerApiClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, UtensilsCrossed } from 'lucide-react';

export default function TableQRPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { initializeSession } = useSession();
  
  const [status, setStatus] = useState<'validating' | 'success' | 'error'>('validating');
  const [errorMessage, setErrorMessage] = useState('');
  const [tableInfo, setTableInfo] = useState<any>(null);

  useEffect(() => {
    const validateAndInitSession = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Invalid QR code - no token provided');
        return;
      }

      try {
        setStatus('validating');

        // Initialize session with QR token
        const response = await customerApi.initSession(token);
        
        // Store session data
        const sessionData = {
          sessionId: response.sessionId,
          sessionSecret: response.sessionSecret,
          tableInfo: response.tableInfo,
          expiresAt: new Date(response.expiresAt),
        };

        initializeSession(sessionData);
        setTableInfo(response.tableInfo);
        setStatus('success');

        // Redirect to ordering page after 1.5 seconds
        setTimeout(() => {
          navigate('/customer/order', { replace: true });
        }, 1500);

      } catch (error: any) {
        console.error('Session initialization failed:', error);
        setStatus('error');
        
        if (error.response?.status === 401) {
          setErrorMessage('Invalid or expired QR code');
        } else if (error.response?.data?.message) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage('Failed to initialize session. Please try again.');
        }
      }
    };

    validateAndInitSession();
  }, [token, navigate, initializeSession]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50/30 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-emerald-400/10 blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 h-80 w-80 animate-pulse rounded-full bg-green-400/10 blur-3xl delay-1000"></div>
      </div>

      <Card className="relative w-full max-w-md overflow-hidden border-2 border-emerald-200/50 bg-white/80 backdrop-blur-sm shadow-2xl">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50/50 to-green-50/50"></div>
        
        <CardContent className="p-8 sm:p-12">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-4 shadow-xl shadow-emerald-600/40">
              <UtensilsCrossed className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Validating State */}
          {status === 'validating' && (
            <div className="text-center">
              <Loader2 className="mx-auto h-16 w-16 animate-spin text-emerald-600" />
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Validating QR Code
              </h2>
              <p className="mt-2 text-gray-600">
                Please wait while we set up your table...
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="animate-in fade-in zoom-in text-center duration-500">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl shadow-green-600/40">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome!</h2>
              {tableInfo && (
                <p className="mt-2 text-lg text-gray-700">
                  Table {tableInfo.number}
                </p>
              )}
              <p className="mt-4 text-gray-600">
                Redirecting to menu...
              </p>
              <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
                <div className="h-full animate-[loading_1.5s_ease-in-out] bg-gradient-to-r from-emerald-600 to-green-600"></div>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="animate-in fade-in zoom-in text-center duration-500">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-2xl shadow-red-600/40">
                <XCircle className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Oops! Something went wrong
              </h2>
              <p className="mt-4 text-gray-700">{errorMessage}</p>
              <div className="mt-8 space-y-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/customer/home')}
                  className="w-full border-2 border-emerald-300"
                >
                  Go to Home
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <style>{`
        @keyframes loading {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
