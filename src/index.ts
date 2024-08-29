import express from 'express';
import type { Request, Response, NextFunction } from 'express';

import { APP_PORT } from './config.js';
import router from './routes/companyRoutes.js';

const app = express();

app.use(express.json());

// Route handlers
app.use('/api/v1/companies', router);

// Catch 404 errors and forward to error handler
app.use((request: Request, response: Response, next: NextFunction) => {
    response.status(404).json({ error: 'Not Found' });
});

// General error handler
app.use((error: any, request: Request, response: Response, next: NextFunction) => {
    response.status(error.status || 500).json({
        error: error.message || 'Internal Server Error'
    });
});

app.use('/api/v1/companies', router);

app.listen(APP_PORT, () => {
    console.log('🚀 Server is running on port', APP_PORT);
});
