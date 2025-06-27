import { cleanEnv, str, port } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();


export const env = cleanEnv(process.env, {
    PORT: port({ 
        desc: 'The port to listen on',
        example: '8000',
        default: 8000 
    }),
    DATABASE_URL: str({
        desc: 'The database URL',
        example: 'postgresql://user:password@localhost:5432/mydb',
    }),
    REDIS_URL: str({
        desc: 'The Redis URL',
        example: 'redis://localhost:6379',
    }),
    RECIPIENT_WALLET_ADDRESS: str({
        desc: 'The recipient wallet address',
        example: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
        default: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
    }),
})