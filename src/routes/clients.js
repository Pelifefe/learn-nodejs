import express from "express";
import { pool } from "../config/database.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const connection = await pool.getConnection();
  const clientId = req.params.id;

  try {
    const [rows] = await connection.query(
      "SELECT * FROM clients WHERE id = ?",
      [clientId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    const client = rows[0];
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

router.put("/:id", async (req, res) => {
  const connection = await pool.getConnection();
  const clientId = req.params.id;
  const { name, birth_date, email, status, fidelity, telephone, obs } =
    req.body;

  if (!name || !birth_date || !email || !status || !fidelity || !telephone) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    const obsValue = obs === null ? "" : obs;

    const [result] = await connection.query(
      `
        UPDATE clients 
        SET name = ?, 
            birth_date = ?, 
            email = ?, 
            status = ?, 
            fidelity = ?, 
            telephone = ?,
            obs = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [name, birth_date, email, status, fidelity, telephone, obsValue, clientId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Cliente não encontrado ou nenhuma alteração feita" });
    }

    res.json({ message: "Cliente atualizado com sucesso" });
  } catch (error) {
    console.error("Erro na atualização:", error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

export { router as clientRoutes };
