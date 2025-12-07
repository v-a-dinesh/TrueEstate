import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase } from '../utils/database.js';
import { loadCSVData } from '../utils/csvLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const loadData = async () => {
  try {
    console.log('Connecting to database...');
    await connectDatabase();
    
    const csvPath = path.join(__dirname, '../../../truestate_assignment_dataset.csv');
    console.log('Loading CSV data from:', csvPath);
    
    await loadCSVData(csvPath);
    
    console.log('Data loaded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error loading data:', error);
    process.exit(1);
  }
};

loadData();
