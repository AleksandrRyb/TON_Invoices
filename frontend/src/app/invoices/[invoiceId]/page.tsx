'use client';

import { Container, Paper, Title, Text, Button, Stack, Loader, Alert, Group, Center } from '@mantine/core';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import apiClient from '@/api';
import { IconAlertCircle } from '@tabler/icons-react';
import { QRCodeCanvas } from 'qrcode.react';

interface Invoice {
  id: string;
  amount: string;
  status: 'pending' | 'completed' | 'expired';
  recipientAddress: string;
}

export default function InvoicePage() {
  const { invoiceId } = useParams();
  const [tonConnectUI] = useTonConnectUI();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!invoiceId) return;

    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/invoices/${invoiceId}`);
        // The backend sends more data, but we only need these fields for now
        const { id, amount, status, recipientAddress } = response.data;
        setInvoice({ id, amount, status, recipientAddress });
      } catch (err) {
        console.error('Failed to fetch invoice:', err);
        setError('Failed to load invoice details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const pay = async () => {
    if (!invoice) return;

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
      messages: [
        {
          address: invoice.recipientAddress,
          amount: (parseFloat(invoice.amount) * 1e9).toString(), // to nanoTONs
          payload: `invoice_${invoice.id}`, // as per README
        },
      ],
    };

    try {
      await tonConnectUI.sendTransaction(transaction);
      // TODO: Show notification about successful transaction sending
      // Note: The status will not update to 'completed' automatically yet.
      // This requires backend polling of the blockchain, which is Step 6.
    } catch (error) {
      console.error('Payment failed:', error);
      // TODO: Show error notification
    }
  };

  const downloadQRCode = () => {
    const canvas = qrCodeRef.current?.querySelector<HTMLCanvasElement>('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice?.id}-qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getPaymentLink = () => {
    if (!invoice) return '';
    const amountNano = (parseFloat(invoice.amount) * 1e9).toString();
    const payload = `invoice_${invoice.id}`;
    console.log("invoice.recipientAddress", invoice.recipientAddress);
    console.log("amountNano", amountNano);
    console.log("payload", payload);
    return `ton://transfer/${invoice.recipientAddress}?amount=${amountNano}&text=${payload}`;
  };

  if (loading) {
    return (
      <Container>
        <Stack align="center" mt="xl">
          <Loader />
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Stack align="center" mt="xl">
          <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red">
            {error}
          </Alert>
        </Stack>
      </Container>
    );
  }

  if (!invoice) {
    return null; // Or a 'not found' message
  }

  return (
    <Container>
      <Stack align="center" mt="xl">
        <Paper withBorder p="xl" radius="md" style={{ maxWidth: 400 }}>
          <Stack gap="lg">
            <Title order={2}>Invoice #{invoice.id}</Title>

            {invoice.status === 'pending' && (
              <Center>
                <div ref={qrCodeRef}>
                  <QRCodeCanvas
                    value={getPaymentLink()}
                    size={256}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"H"}
                    includeMargin={true}
                  />
                </div>
              </Center>
            )}

            <Text>Amount: <strong>{invoice.amount} TON</strong></Text>
            <Text>Status: <Text span fw={700}>{invoice.status}</Text></Text>
            <Text>Recipient: <Text span ff="monospace" fz="sm">{invoice.recipientAddress}</Text></Text>
            
            {invoice.status === 'pending' && (
              <Group grow>
              <Button onClick={pay}>Pay with Wallet</Button>
                <Button onClick={downloadQRCode} variant="outline">
                  Download QR
                </Button>
              </Group>
            )}

            {invoice.status === 'completed' && (
              <Text c="green" fw={700}>Payment confirmed!</Text>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
} 