import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import pool from './src/config/database.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Middleware para verificar conexão com banco
app.use(async (req, res, next) => {
  try {
    await pool.execute('SELECT 1');
    next();
  } catch (error) {
    console.error('Erro na conexão com MySQL:', error);
    res.status(500).json({ error: 'Erro de conexão com banco de dados' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/produtos', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'produtos.html'));
});

app.post('/api/produtos', async (req, res) => {
  const { name, price, quantity, category } = req.body;
  
  try {
    // Validação básica
    if (!name || !price || !quantity || !category) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const [result] = await pool.execute(
      'INSERT INTO products (name, price, quantity, category) VALUES (?, ?, ?, ?)',
      [name, price, quantity, category]
    );
    
    console.log('Produto cadastrado com sucesso:', { id: result.insertId, name });
    res.redirect('/produtos');
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/produtos', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products ORDER BY created_at DESC');
    console.log(`${rows.length} produtos encontrados`);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota de teste para verificar conexão
app.get('/api/test-connection', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({ message: 'Conexão com MySQL estabelecida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Falha na conexão com MySQL' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});