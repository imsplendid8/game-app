import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { initSentry, setUser, clearUser } from '@/lib/sentry';
import { trackWebVitals } from '@/lib/performance';
import FeedbackWidget from '@/components/FeedbackWidget';
import '../styles/globals.css';

// Initialize Sentry on mount
initSentry();

export default function App({ Component, pageProps }: AppProps) {
  const { hydrate, user } = useAuthStore((state) => ({
    hydrate: state.hydrate,
    user: state.user,
  }));

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Track user for error reporting
  useEffect(() => {
    if (user?.id) {
      setUser(user.id, user.email);
    } else {
      clearUser();
    }
  }, [user?.id, user?.email]);

  // Initialize Web Vitals tracking
  useEffect(() => {
    trackWebVitals();
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <FeedbackWidget />
    </>
  );
}
