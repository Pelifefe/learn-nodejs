import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';  // Atualizado para importar o pool de conexões do MySQL

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, name, cpf, birth_date, role = 'default' } = req.body;
  const connection = await pool.getConnection();  // Obtém uma conexão do pool
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserção de dados no MySQL
    await connection.query(`
      INSERT INTO users (name, email, password, cpf, birth_date, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, email, hashedPassword, cpf, birth_date, role]);

    res.json({ message: 'Registration successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();  // Libera a conexão de volta ao pool
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const connection = await pool.getConnection();  // Obtém uma conexão do pool
  
  try {
    // Consulta ao banco de dados para buscar o usuário
    const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password))) {
      throw new Error('Invalid credentials');
    }

    const user = rows[0];
    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(401).json({ error: error.message });
  } finally {
    connection.release();  // Libera a conexão de volta ao pool
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy();  // Destrói a sessão
  res.json({ message: 'Logout successful' });
});

export { router as authRoutes };
