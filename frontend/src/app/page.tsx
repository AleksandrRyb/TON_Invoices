'use client';

import { Button, Container, Stack, NumberInput, Group } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/api";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, address } = useAuth();
  const [amount, setAmount] = useState<string | number>('');
  const [loading, setLoading] = useState(false);

  console.log("isAuthenticated", isAuthenticated);
  console.log("address", address);
  console.log("amount", amount);

  const createInvoice = async () => {
    if (!isAuthenticated || !address || !amount || +amount <= 0) {
      console.error('User is not authenticated or amount is invalid');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/invoices', {
        address: address,
        amount: amount.toString(),
      });
      
      const { invoiceId } = response.data;
      router.push(`/invoices/${invoiceId}`);

    } catch (error) {
      console.error('Failed to create invoice:', error);
      // TODO: Show error notification to user
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Stack align="center" mt="xl">
        <Stack gap="md" style={{ maxWidth: 300 }}>
          <NumberInput
            label="Invoice Amount"
            placeholder="Enter amount in TON"
            value={amount}
            onChange={setAmount}
            min={0.000001}
            decimalScale={6}
            required
          />
          <Button 
            onClick={createInvoice} 
            disabled={!isAuthenticated || !amount || +amount <= 0}
            loading={loading}
          >
            Create Invoice
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
