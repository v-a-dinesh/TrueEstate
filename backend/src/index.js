import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionRoutes from './routes/transactionRoutes.js';
import { connectTurso } from './utils/tursoDatabase.js';
import { loadCSVToMemory } from './utils/csvFallback.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', transactionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    dataSource: 'Turso (with CSV fallback)'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    let tursoConnected = false;
    let csvLoaded = false;

    // Try to connect to Turso first
    try {
      console.log('Connecting to Turso database...');
      await connectTurso();
      console.log('Turso database connected successfully');
      tursoConnected = true;
    } catch (tursoError) {
      console.warn('Turso connection failed:', tursoError.message);
      console.log('Will attempt CSV fallback');
    }
    
    // Try to load CSV as fallback (if file exists)
    try {
      console.log('Loading CSV data into memory as fallback...');
      await loadCSVToMemory();
      console.log('CSV fallback loaded successfully');
      csvLoaded = true;
    } catch (csvError) {
      console.warn('CSV loading failed:', csvError.message);
      if (!tursoConnected) {
        throw new Error('Both Turso and CSV fallback failed. Cannot start server.');
      }
      console.log('Continuing with Turso only (CSV not available)');
    }
    
    if (!tursoConnected && !csvLoaded) {
      throw new Error('No data source available');
    }

    const dataSource = tursoConnected && csvLoaded 
      ? 'Turso (primary) with CSV fallback'
      : tursoConnected 
        ? 'Turso only' 
        : 'CSV only';
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Data source: ${dataSource}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
