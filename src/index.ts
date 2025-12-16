import app from "./App";
import { pool, config } from "./adapters/config/config"; 

try {
    config.initialize(); 

    const PORT = process.env.PORT || '3000';
    const NODE_ENV = process.env.NODE_ENV || 'development';

    app.listen(PORT, async () => {
        try {
            await pool.getConnection();
            console.log(`Server running in ${NODE_ENV} mode on port ${PORT}🚀`);
        } catch (error) {
            console.error("Database connection failed:", error);
            process.exit(1);
        }
    });

} catch (error: any) {
    console.error(`Falha FATAL na inicialização: ${error.message}`);
    process.exit(1);
}