import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSession } from '@/contexts';
import { customerApi } from '@/lib/api/customerApiClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  UtensilsCrossed,
  QrCode,
  Camera,
  Menu as MenuIcon,
} from 'lucide-react';

// Global flag to prevent duplicate requests across StrictMode unmount/remount
const initializingTokens = new Set<string>();

export default function TableQRPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { initializeSession, session, clearSession } = useSession();

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

      // Check if this token is already being initialized
      if (initializingTokens.has(token)) {
        console.log('Session initialization already in progress for this token, skipping...');
        return;
      }

      // Mark token as being initialized
      initializingTokens.add(token);

      try {
        // Step 1: Decode token to get table info
        let tableIdFromToken: string | null = null;
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            tableIdFromToken = payload.tableId;
          }
        } catch (err) {
          console.log('Could not decode token:', err);
        }

        // Step 2: Check if user has existing session in localStorage
        if (session && tableIdFromToken && session.tableInfo.id === tableIdFromToken) {
          console.log('Found existing session for this table');
          console.log('Session ID:', session.sessionId);
          console.log('Table ID from session:', session.tableInfo.id);
          console.log('Table ID from token:', tableIdFromToken);

          // Simply redirect to menu - the guard will validate
          setTableInfo(session.tableInfo);
          setStatus('success');

          setTimeout(() => {
            navigate('/customer/order', { replace: true });
            initializingTokens.delete(token);
          }, 500);
          return;
        }

        // Step 3: Create new session
        setStatus('validating');

        try {
          const data = await customerApi.initSession(token);

          console.log('Session created successfully:', data);

          if (!data.sessionId || !data.sessionSecret) {
            throw new Error('Invalid response from server');
          }

          // Store session data
          const sessionData = {
            sessionId: data.sessionId,
            sessionSecret: data.sessionSecret,
            tableInfo: data.tableInfo,
            expiresAt: new Date(data.expiresAt),
          };

          initializeSession(sessionData);
          setTableInfo(data.tableInfo);
          setStatus('success');

          // Redirect to ordering page after 1.5 seconds
          setTimeout(() => {
            navigate('/customer/order', { replace: true });
            initializingTokens.delete(token);
          }, 1500);
        } catch (createError: any) {
          // Handle session creation errors

          initializingTokens.delete(token);

          // Check if table is occupied
          if (createError.response?.status === 400) {
            const errorMsg = createError.response?.data?.message || '';

            if (errorMsg.includes('occupied')) {
              // Table has active session
              // Check if we might have the session in localStorage
              const storedSession = localStorage.getItem('table_session');
              if (storedSession) {
                try {
                  const { sessionId, tableInfo: storedTableInfo } = JSON.parse(storedSession);

                  // If we have a session for this table, just redirect to menu
                  if (storedTableInfo.id === tableIdFromToken) {
                    console.log('Table occupied but we have a session. Redirecting to menu...');

                    setStatus('success');
                    setTableInfo(storedTableInfo);

                    setTimeout(() => {
                      navigate('/customer/order', { replace: true });
                    }, 500);
                    return; // Return early - no error to show
                  }
                } catch (e) {
                  console.error('Failed to parse stored session:', e);
                }
              }

              // If we reach here, we don't have a valid session
              console.error('Failed to create session:', createError);
              setStatus('error');
              setErrorMessage(errorMsg);
            } else {
              console.error('Failed to create session:', createError);
              setStatus('error');
              setErrorMessage(errorMsg);
            }
          } else if (createError.response?.status === 401) {
            console.error('Failed to create session:', createError);
            setStatus('error');
            setErrorMessage('Invalid or expired QR code');
          } else if (createError.response?.data?.message) {
            console.error('Failed to create session:', createError);
            setStatus('error');
            setErrorMessage(createError.response.data.message);
          } else {
            console.error('Failed to create session:', createError);
            setStatus('error');
            setErrorMessage('Failed to initialize session. Please try again.');
          }
        }
      } catch (error: any) {
        console.error('Unexpected error:', error);
        setStatus('error');
        initializingTokens.delete(token);
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    };

    validateAndInitSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only depend on token

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#FAF7F5]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#EBE5E0] bg-white px-6 py-4 whitespace-nowrap lg:px-40">
        <div className="flex items-center gap-4 text-[#1F1F1F]">
          <div className="text-primary size-8">
            <UtensilsCrossed className="h-8 w-8" />
          </div>
          <h2 className="text-xl leading-tight font-bold tracking-tight">Fine Dining BBQ</h2>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          <nav className="hidden items-center gap-9 text-sm font-medium md:flex">
            <Link to="/customer/home" className="hover:text-primary transition-colors">
              Menu
            </Link>
            <Link to="/customer/reservation" className="hover:text-primary transition-colors">
              Reservations
            </Link>
            <a href="#" className="hover:text-primary transition-colors">
              Locations
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="md:hidden">
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#EBE5E0] bg-white shadow-sm">
          <div className="flex flex-col items-center p-8 text-center sm:p-12">
            {/* Default/No Session State */}
            {status === 'validating' && (
              <>
                {/* Icon / Illustration */}
                <div className="bg-primary/10 text-primary relative mb-8 flex size-24 items-center justify-center rounded-full">
                  <Loader2 className="h-12 w-12 animate-spin" />
                  {/* Decorative element behind */}
                  <div className="border-primary/20 absolute inset-0 scale-125 rounded-full border"></div>
                </div>
                {/* Text Content */}
                <h1 className="mb-4 text-2xl leading-tight font-extrabold tracking-tight text-[#1F1F1F] sm:text-3xl">
                  Validating QR Code
                </h1>
                <p className="mx-auto mb-8 max-w-[320px] text-base leading-relaxed text-[#6B5A5A]">
                  Please wait while we set up your table session...
                </p>
              </>
            )}

            {/* Success State */}
            {status === 'success' && (
              <>
                <div className="bg-primary/10 text-primary relative mb-8 flex size-24 items-center justify-center rounded-full">
                  <CheckCircle2 className="h-12 w-12" />
                  <div className="border-primary/20 absolute inset-0 scale-125 rounded-full border"></div>
                </div>
                <h1 className="mb-4 text-2xl leading-tight font-extrabold tracking-tight text-[#1F1F1F] sm:text-3xl">
                  Welcome!
                </h1>
                {tableInfo && (
                  <p className="mb-4 text-lg text-gray-700">Table {tableInfo.number}</p>
                )}
                <p className="mx-auto mb-8 max-w-[320px] text-base leading-relaxed text-[#6B5A5A]">
                  Redirecting to menu...
                </p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-red-100">
                  <div className="from-primary h-full animate-[loading_1.5s_ease-in-out] bg-gradient-to-r to-[#9b0c0c]"></div>
                </div>
              </>
            )}

            {/* Error State */}
            {status === 'error' && (
              <>
                <div className="relative mb-8 flex size-24 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                  <XCircle className="h-12 w-12" />
                  <div className="absolute inset-0 scale-125 rounded-full border border-red-500/20"></div>
                </div>
                <h1 className="mb-4 text-2xl leading-tight font-extrabold tracking-tight text-[#1F1F1F] sm:text-3xl">
                  Oops! Something went wrong
                </h1>
                <p className="mx-auto mb-8 max-w-[320px] text-base leading-relaxed text-[#6B5A5A]">
                  {errorMessage}
                </p>
                {/* Actions */}
                <div className="flex w-full flex-col gap-3">
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-primary flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-red-700 hover:shadow-lg"
                  >
                    <span>Try Again</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/customer/home')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#EBE5E0] bg-transparent px-6 py-3.5 font-semibold text-[#1F1F1F] transition-colors duration-200 hover:bg-[#FAF7F5]"
                  >
                    <span>Return to Home</span>
                  </Button>
                </div>
                {/* Helper Link */}
                <div className="mt-8 w-full border-t border-[#f4f0f0] pt-6">
                  <p className="text-sm text-[#896161]">
                    Having trouble scanning?{' '}
                    <a href="#" className="text-primary font-semibold hover:underline">
                      Ask a server for help
                    </a>
                  </p>
                </div>
              </>
            )}

            {/* Show scan button only when not in any special state or when ready */}
            {status !== 'validating' && status !== 'success' && status !== 'error' && (
              <>
                {/* Icon / Illustration */}
                <div className="bg-primary/10 text-primary relative mb-8 flex size-24 items-center justify-center rounded-full">
                  <QrCode className="h-12 w-12" />
                  {/* Decorative element behind */}
                  <div className="border-primary/20 absolute inset-0 scale-125 rounded-full border"></div>
                </div>
                {/* Text Content */}
                <h1 className="mb-4 text-2xl leading-tight font-extrabold tracking-tight text-[#1F1F1F] sm:text-3xl">
                  Ready to Order?
                </h1>
                <p className="mx-auto mb-8 max-w-[320px] text-base leading-relaxed text-[#6B5A5A]">
                  We need to know where you are seated. Please scan the QR code located on your
                  table to start your dining session.
                </p>
                {/* Actions */}
                <div className="flex w-full flex-col gap-3">
                  <button className="bg-primary flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-red-700 hover:shadow-lg">
                    <Camera className="h-5 w-5" />
                    <span>Scan QR Code</span>
                  </button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/customer/home')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#EBE5E0] bg-transparent px-6 py-3.5 font-semibold text-[#1F1F1F] transition-colors duration-200 hover:bg-[#FAF7F5]"
                  >
                    <span>Return to Home</span>
                  </Button>
                </div>
                {/* Helper Link */}
                <div className="mt-8 w-full border-t border-[#f4f0f0] pt-6">
                  <p className="text-sm text-[#896161]">
                    Having trouble scanning?{' '}
                    <a href="#" className="text-primary font-semibold hover:underline">
                      Ask a server for help
                    </a>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-6 border-t border-[#f4f0f0] bg-white px-5 py-10 text-center">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <a href="#" className="hover:text-primary font-medium text-[#896161] transition-colors">
            Privacy Policy
          </a>
          <span className="hidden text-[#EBE5E0] sm:block">•</span>
          <a href="#" className="hover:text-primary font-medium text-[#896161] transition-colors">
            Terms of Service
          </a>
          <span className="hidden text-[#EBE5E0] sm:block">•</span>
          <a href="#" className="hover:text-primary font-medium text-[#896161] transition-colors">
            Contact Us
          </a>
        </div>
        <p className="text-xs font-normal text-[#896161]">
          © 2024 Fine Dining BBQ. All rights reserved.
        </p>
      </footer>

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
