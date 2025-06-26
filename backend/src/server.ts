import http from 'http';
import app from './app';
import 'dotenv/config';

const port = process.env.PORT || 8000;

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 