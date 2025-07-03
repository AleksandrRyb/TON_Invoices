'use client';

import { TonConnectButton } from '@tonconnect/ui-react';
import { Box, Group, Title } from '@mantine/core';

export function Header() {
  return (
    <Box component="header" p="md">
      <Group justify="space-between">
        <Title order={3}>Mini-Holders</Title>
        <TonConnectButton />
      </Group>
    </Box>
  );
} 