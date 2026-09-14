import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <Component {...pageProps} />;
}
