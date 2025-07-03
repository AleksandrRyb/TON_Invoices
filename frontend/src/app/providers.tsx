'use client';

import { MantineProvider } from '@mantine/core';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { ReactNode } from 'react';
import { AuthProvider } from '../context/AuthContext';

export function Providers({ children }: { children: ReactNode }) {
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;

  const manifestUrl = new URL('/tonconnect-manifest.json', frontendUrl).toString();

  return (
    <MantineProvider>
      <TonConnectUIProvider manifestUrl={manifestUrl}>
        <AuthProvider>{children}</AuthProvider>
      </TonConnectUIProvider>
    </MantineProvider>
  );
} 