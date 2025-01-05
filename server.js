import express from 'express';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { pool } from './src/config/database.js';
import { authRoutes } from './src/routes/auth.js';
import { userRoutes } from './src/routes/users.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

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

// Auth middleware
const authMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Rota de teste para verificar conexão
app.get('/api/test-connection', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({ message: 'Conexão com MySQL estabelecida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Falha na conexão com MySQL' });
  }
});

// Routes
app.use('/auth', authRoutes);
app.use('/users', authMiddleware, userRoutes);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'src/public', 'index.html'));
}); 

// Produtos
app.get('/register-products', (req, res) => {
  res.sendFile(join(__dirname, 'src/public', 'register-products.html'));
});

app.get('/produtos', (req, res) => {
  res.sendFile(join(__dirname, 'src/public', 'produtos.html'));
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

//Users

app.get('/users', (req, res) => {
  res.sendFile(join(__dirname, 'src/public', 'users.html'));
});

app.get('/admin-users', async (req, res) => {

  try {
    const [rows] = await pool.execute('SELECT * FROM users ORDER BY created_at DESC');
    console.log(`${rows.length} usuários encontrados`);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/profile', authMiddleware, (req, res) => {
  res.sendFile(join(__dirname, 'src/public', 'profile.html'));
});


//Clients

app.get('/dashboard', (req, res) => {
  res.sendFile(join(__dirname, 'src/public', 'dashboard.html'));
});

app.get('/clients', async (req, res) => {

  try {
    const [rows] = await pool.execute('SELECT * FROM clients ORDER BY created_at DESC');
    console.log(`${rows.length} clientes encontrados`);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rotas de autenticação
app.get('/register', (req, res) => {
  res.sendFile(join(__dirname, 'src/public', 'register.html'));
});

app.get('/register-client', (req, res) => {
  res.sendFile(join(__dirname, 'src/public', 'register-client.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(join(__dirname, 'src/public', 'login.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});