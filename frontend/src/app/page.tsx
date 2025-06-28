import { Button, Container, Stack, Title } from "@mantine/core";

export default function Home() {
  return (
    <Container>
      <Stack align="center" mt="xl">
        <Title>Mini-Holders</Title>
        <Button>Create Invoice</Button>
      </Stack>
    </Container>
  );
}
