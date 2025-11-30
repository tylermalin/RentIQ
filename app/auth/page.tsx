'use client';

import { useState, FormEvent, useEffect } from 'react';
import { signIn, getProviders } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'signup' | 'signin'>('signup');
  
  // Sign Up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState('');

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [googleProviderAvailable, setGoogleProviderAvailable] = useState(false);

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setSignUpLoading(true);
    setSignUpError('');

    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError('Passwords do not match');
      setSignUpLoading(false);
      return;
    }

    if (signUpPassword.length < 8) {
      setSignUpError('Password must be at least 8 characters');
      setSignUpLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signUpEmail,
          password: signUpPassword,
          name: signUpName || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSignUpError(data.error || 'Failed to create account');
        setSignUpLoading(false);
        return;
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email: signUpEmail,
        password: signUpPassword,
        redirect: false,
      });

      if (result?.error) {
        setSignUpError('Account created but sign in failed. Please try signing in.');
        setSignUpLoading(false);
      } else {
        router.push('/search');
        router.refresh();
      }
    } catch (err) {
      setSignUpError('An error occurred. Please try again.');
      setSignUpLoading(false);
    }
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setSignInLoading(true);
    setSignInError('');

    try {
      const result = await signIn('credentials', {
        email: signInEmail,
        password: signInPassword,
        redirect: false,
      });

      if (result?.error) {
        setSignInError('Invalid email or password');
        setSignInLoading(false);
      } else {
        router.push('/search');
        router.refresh();
      }
    } catch (err) {
      setSignInError('An error occurred. Please try again.');
      setSignInLoading(false);
    }
  };

  // Check if Google provider is available
  useEffect(() => {
    getProviders().then((providers) => {
      setGoogleProviderAvailable(!!providers?.google);
    });
  }, []);

  const handleGoogleAuth = () => {
    signIn('google', { callbackUrl: '/search' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <Logo />
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex" aria-label="Tabs">
              <button
                onClick={() => {
                  setActiveTab('signup');
                  setSignUpError('');
                  setSignInError('');
                }}
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === 'signup'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Create an account
              </button>
              <button
                onClick={() => {
                  setActiveTab('signin');
                  setSignUpError('');
                  setSignInError('');
                }}
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === 'signin'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign in
              </button>
            </nav>
          </div>

          <div className="p-8">
            {/* Sign Up Form */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                {signUpError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {signUpError}
                  </div>
                )}
                <div>
                  <label htmlFor="signUpName" className="block text-sm font-medium text-gray-700 mb-2">
                    Name (Optional)
                  </label>
                  <input
                    id="signUpName"
                    type="text"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="signUpEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address *
                  </label>
                  <input
                    id="signUpEmail"
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label htmlFor="signUpPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    id="signUpPassword"
                    type="password"
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Password (min. 8 characters)"
                  />
                </div>
                <div>
                  <label htmlFor="signUpConfirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    id="signUpConfirmPassword"
                    type="password"
                    required
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={signUpLoading}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {signUpLoading ? 'Creating account...' : 'Create account'}
                </button>
              </form>
            )}

            {/* Sign In Form */}
            {activeTab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                {signInError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {signInError}
                  </div>
                )}
                <div>
                  <label htmlFor="signInEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address *
                  </label>
                  <input
                    id="signInEmail"
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label htmlFor="signInPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    id="signInPassword"
                    type="password"
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={signInLoading}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {signInLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            )}

            {/* Google OAuth Button - Only show if provider is configured */}
            {googleProviderAvailable && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="mt-4 w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

