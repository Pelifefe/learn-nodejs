import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Configuração da conexão com o MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Função para criar as tabelas no MySQL
async function createTables() {
  const connection = await pool.getConnection();

  try {
    // Criação da tabela 'users'
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        cpf VARCHAR(11) UNIQUE NOT NULL,
        birth_date DATE NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'default',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    // Criação da tabela 'clients'
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        birth_date DATE NOT NULL,
        status VARCHAR(255) NOT NULL DEFAULT 'em negociação',
        cpf VARCHAR(11) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        telephone VARCHAR(11) NOT NULL DEFAULT '00000000000',
        obs VARCHAR(3000) DEFAULT '',
        fidelity INT NOT NULL DEFAULT 1 CHECK (fidelity >= 1 AND fidelity <= 5),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  } finally {
    connection.release();
  }
}


// Função para garantir que o usuário admin exista
async function createAdminUser() {
  const connection = await pool.getConnection();

  try {
    // Verifica se o admin já existe
    const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@admin']);
    
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('root', 10);

      // Criação do usuário admin
      await connection.query(`
        INSERT INTO users (name, email, password, cpf, birth_date, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['Admin', 'admin@admin', hashedPassword, '00000000000', '2000-01-01', 'admin']);
    }
  } finally {
    connection.release();
  }
}

// Função para garantir que o cliente de teste exista
async function createTestClient() {
  const connection = await pool.getConnection();

  try {
    // Verifica se o cliente de teste já existe
    const [rows] = await connection.query('SELECT * FROM clients WHERE email = ?', ['testclient@test.com']);
    
    if (rows.length === 0) {
      // Criação do cliente de teste
      await connection.query(`
        INSERT INTO clients (name, birth_date, status, cpf, email, telephone, obs, fidelity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, ['Test Client', '1990-01-01', 'em negociação', '11111111111', 'testclient@test.com', '12345678910', 'Test client for listing purposes', 3]);
    }
  } finally {
    connection.release();
  }
}

// Execução das funções de criação de tabelas, admin e cliente de teste
async function initializeDatabase() {
  await createTables();
  await createAdminUser();
  await createTestClient();
}

initializeDatabase().catch(console.error);

export { pool };
