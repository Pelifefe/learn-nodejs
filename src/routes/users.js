import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

// Obter perfil do usuário
router.get('/profile', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [req.session.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];
    delete user.password; // Remover a senha antes de retornar os dados do usuário
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  } finally {
    connection.release(); // Liberar a conexão de volta ao pool
  }
});

// Atualizar perfil do usuário
router.put('/profile', async (req, res) => {
  const connection = await pool.getConnection();
  const { name, birth_date } = req.body;

  try {
    const [result] = await connection.query(`
      UPDATE users
      SET name = ?, birth_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, birth_date, req.session.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found or no changes made' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  } finally {
    connection.release(); // Liberar a conexão de volta ao pool
  }
});

// Rotas administrativas
router.get('/all', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [userRows] = await connection.query('SELECT role FROM users WHERE id = ?', [req.session.user.id]);

    if (userRows.length === 0 || userRows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const [users] = await connection.query('SELECT * FROM users');
    users.forEach(user => delete user.password); // Remover senhas de todos os usuários antes de retornar
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  } finally {
    connection.release(); // Liberar a conexão de volta ao pool
  }
});

export { router as userRoutes };
