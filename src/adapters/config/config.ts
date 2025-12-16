import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') }); 


const { DB_HOST, DB_USER, DB_NAME, DB_PASS, JWT_SECRET } = process.env;

if (!DB_HOST || !DB_USER || !DB_NAME || !DB_PASS) {
    throw new Error("Credenciais do banco de dados (DB_HOST, DB_USER, DB_NAME, DB_PASS) estão ausentes nas variáveis de ambiente!");
}


export const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: "Z",
});

export class config {
    private static instance: config;
    private readonly JWT_SECRET: string;

    private constructor(secret: string) {
        this.JWT_SECRET = secret;
    }

    public static initialize(): config {
        if (config.instance) return config.instance;

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret || jwtSecret.trim() === '') {
            throw new Error('FATAL ERROR: JWT_SECRET is not defined in the environment variables (.env).');
        }

        config.instance = new config(jwtSecret);
        return config.instance;
    }

    public static JWT(): string {
        if (!config.instance) {
            throw new Error('Configuration not initialized. Call config.initialize() first.');
        }
        return config.instance.JWT_SECRET;
    }
}