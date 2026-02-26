import express from 'express';
import goldRoutes from './routes/gold';

const app = express();
const PORT = 3000;

app.use(express.json());
console.log('Registering routes...');
app.use('/api', goldRoutes);
console.log('Routes registered');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
