import express from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../config/db.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Obtener todos los reportes
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reportes ORDER BY fecha DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear reporte
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    const { titulo, cuerpo } = req.body;
    const imagen = req.file ? req.file.filename : null;
    
    const [result] = await pool.query(
      'INSERT INTO reportes (titulo, cuerpo, imagen) VALUES (?, ?, ?)',
      [titulo, cuerpo, imagen]
    );
    
    res.json({ id: result.insertId, titulo, cuerpo, imagen });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar reporte
router.put('/:id', upload.single('imagen'), async (req, res) => {
  try {
    const { titulo, cuerpo } = req.body;
    const imagen = req.file ? req.file.filename : req.body.imagenActual;
    
    await pool.query(
      'UPDATE reportes SET titulo = ?, cuerpo = ?, imagen = ? WHERE id = ?',
      [titulo, cuerpo, imagen, req.params.id]
    );
    
    res.json({ message: 'Reporte actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar reporte
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM reportes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Reporte eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;