'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useTonConnectUI, ConnectedWallet, useTonAddress } from '@tonconnect/ui-react';
import apiClient from '@/api';

interface AuthContextType {
  isAuthenticated: boolean;
  address: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tonConnectUI] = useTonConnectUI();
  const [address, setAddress] = useState<string | null>(null);
  const isAuthenticated = !!address;
  const userFriendlyAddress = useTonAddress();
  

  // This effect handles the initial authentication state and session restoration.
  useEffect(() => {
    // 1. Listen for the connection to be restored.
    tonConnectUI.connectionRestored.then(restored => {
      // 2. If restored and we have an address from the wallet, but not in our state, set it.
      if (restored && userFriendlyAddress && !address) {
        setAddress(userFriendlyAddress);
      }
    });

    // 3. Handle status changes (e.g., user connects/disconnects).
    const unsubscribe = tonConnectUI.onStatusChange(
      (newWallet: ConnectedWallet | null) => {
        if (newWallet) {
          // If a new wallet connects with a proof, verify it.
          if (newWallet.connectItems?.tonProof) {
            verifyProof(newWallet);
          } else {
            // Otherwise, just set the address. This covers re-connection without a new proof.
            setAddress(newWallet.account.address);
          }
        } else {
          // If disconnected, clear the address.
          setAddress(null);
        }
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userFriendlyAddress]);

  console.log("TonConnectUI", tonConnectUI);

  // This function sends the wallet's proof to the backend for verification
  const verifyProof = useCallback(async (wallet: ConnectedWallet) => {
    try {
      const tonProof = wallet.connectItems?.tonProof;

      if (!tonProof || !('proof' in tonProof)) {
        throw new Error('TON Proof not found in wallet connection items');
      }

      const { data: verifyData } = await apiClient.post('/auth/verify', {
        address: wallet.account.address,
        publicKey: wallet.account.publicKey,
        proof: tonProof.proof
      });

      if (verifyData.success) {
        setAddress(verifyData.user.address);
        console.log('Authentication successful:', verifyData.user);
      } else {
        throw new Error(verifyData.error || 'Proof verification failed');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      setAddress(null);
      await tonConnectUI.disconnect();
    }
  }, [tonConnectUI]);
  
  // Set the proof request payload when the auth modal is opened
  useEffect(() => {
    const setProofRequestPayload = async () => {
      if (tonConnectUI.connected) {
          tonConnectUI.setConnectRequestParameters(null);
          return;
      }
      
      tonConnectUI.setConnectRequestParameters({ state: 'loading' });

      try {
        const { data: challengeData } = await apiClient.post('/auth/challenge');

        if (challengeData.payload) {
          tonConnectUI.setConnectRequestParameters({
            state: 'ready',
            value: { tonProof: challengeData.payload },
          });
        } else {
          throw new Error('Failed to get challenge payload');
        }
      } catch (error) {
        console.error('Failed to get TON proof payload:', error);
        tonConnectUI.setConnectRequestParameters(null); // Clear params on error
      }
    };

    const unsubscribe = tonConnectUI.onModalStateChange((modalState) => {
      if (modalState.status === 'opened') {
        setProofRequestPayload();
      }
    });
    
    return () => unsubscribe();
  }, [tonConnectUI]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, address }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 