'use client';

import { Button, Container, Stack } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/api";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, address } = useAuth();

  const createInvoice = async () => {
    if (!isAuthenticated || !address) {
      // TODO: Maybe prompt user to connect wallet
      console.error('User is not authenticated');
      return;
    }

    try {
      const response = await apiClient.post('/invoices', {
        address: address, // Send authenticated user's address
        amount: '1', // Example amount
      });
      
      const { invoiceId } = response.data;
      router.push(`/invoices/${invoiceId}`);

    } catch (error) {
      console.error('Failed to create invoice:', error);
      // TODO: Show error notification to user
    }
  };

  return (
    <Container>
      <Stack align="center" mt="xl">
        <Button onClick={createInvoice} disabled={!isAuthenticated}>
          Create Invoice
        </Button>
      </Stack>
    </Container>
  );
}
