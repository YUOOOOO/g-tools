import express from 'express';
import path from 'path';
import goldRoutes from './routes/gold';

const app = express();
const PORT = 3000;

app.use(express.json());
console.log('Registering routes...');
app.use('/api', goldRoutes);
console.log('Routes registered');

// Serve static files from client build in production
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
