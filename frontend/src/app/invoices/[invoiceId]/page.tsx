'use client';

import { Container, Paper, Title, Text, Button, Stack } from '@mantine/core';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useParams } from 'next/navigation';

export default function InvoicePage() {
  const { invoiceId } = useParams();
  const [tonConnectUI] = useTonConnectUI();

  // TODO: Fetch invoice details from backend using invoiceId
  const invoice = {
    amount: '1', // in TON
    status: 'pending',
    recipientAddress: 'EQ...ADDRESS...', // TODO: Get from backend
  };

  const pay = async () => {
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
      messages: [
        {
          address: invoice.recipientAddress,
          amount: (parseFloat(invoice.amount) * 1e9).toString(), // to nanoTONs
          payload: `invoice_${invoiceId}`, // as per README
        },
      ],
    };

    try {
      await tonConnectUI.sendTransaction(transaction);
      // TODO: Show notification about successful transaction sending
    } catch (error) {
      console.error(error);
      // TODO: Show error notification
    }
  };


  return (
    <Container>
      <Stack align="center" mt="xl">
        <Paper withBorder p="xl" radius="md" style={{ maxWidth: 400 }}>
          <Stack gap="lg">
            <Title order={2}>Invoice #{invoiceId}</Title>
            <Text>Amount: {invoice.amount} TON</Text>
            <Text>Status: {invoice.status}</Text>
            {invoice.status === 'pending' && (
              <Button onClick={pay}>Pay with Wallet</Button>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
} 