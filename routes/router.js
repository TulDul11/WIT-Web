const express = require('express');
const router = express.Router();
const db = require('../config/db');

/* Formato de router por query
Cambiar cualquier parte entre << >>

router.get('/<<Extension donde quieres el fetch>><</: (Solo si requieres inputs)>><<Cualquier input>>', async (req, res) => {
    try {
        const [results] = await db.query('<<Query que quieres hacer>>'<<, [input]>>);
        res.json(results);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
})
*/

router.get('/login_info/:id', async (req, res) => {
    try {
        const user_id = req.params.id;
        const [results] = await db.query('SELECT contrasena, rol FROM usuarios WHERE id = ?', [user_id]);

        if (results.length == 0) {
            return res.status(404).json({
                message: 'Error: Usuario no encontrado'
            })
        }

        res.json(results[0]);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
})

router.get('/user_home/:id/:role', async (req, res) => {
    try {
        const user_id = req.params.id;
        const user_role = req.params.role;

        const query = `SELECT id, nombre, apellido FROM ${user_role} WHERE id_usuario = ${user_id}`

        const [results] = await db.query(query);

        if (results.length == 0) {
            return res.status(404).json({
                message: 'Error: Usuario no encontrado'
            })
        }

        res.json(results[0]);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
})

//guardar contenido del modulo
router.post('/modulos', async (req, res) => {
    const { titulo, contenido } = req.body;
  
    try {
      const [result] = await db.query(
        'INSERT INTO modulos (titulo, contenido_html) VALUES (?, ?)',
        [titulo, contenido]
      );
  
      res.json({ moduloId: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al guardar el módulo' });
    }
  });
  

// Ruta para guardar las preguntas asociadas al módulo
router.post('/modulos/:id/preguntas', async (req, res) => {
  const moduloId = req.params.id;
  const { preguntas } = req.body;

  const conn = await db.getConnection();

  try {
    console.log(">>> INICIO GUARDADO PREGUNTAS PARA MÓDULO ID:", moduloId);
    console.log(">>> Preguntas recibidas:", preguntas);

    await conn.beginTransaction();

    const [deleteResult] = await conn.query('DELETE FROM preguntas WHERE modulo_id = ?', [moduloId]);
    console.log(">>> Preguntas eliminadas:", deleteResult.affectedRows);

    for (const pregunta of preguntas) {
      await conn.query(
        'INSERT INTO preguntas (modulo_id, texto, respuestas, correcta) VALUES (?, ?, ?, ?)',
        [
          moduloId,
          pregunta.texto,
          JSON.stringify(pregunta.respuestas),
          pregunta.correcta
        ]
      );
    }

    await conn.commit();
    console.log(">>> COMMIT: Preguntas nuevas insertadas.");
    res.json({ message: 'Preguntas actualizadas correctamente' });

  } catch (err) {
    await conn.rollback();
    console.error(">>> ERROR:", err);
    res.status(500).json({ error: 'Error al actualizar preguntas' });
  } finally {
    conn.release();
  }
});

//get las preguntas del modulo
router.get('/modulos/:id/preguntas', async (req, res) => {
  const moduloId = parseInt(req.params.id);

  try {
    const [preguntas] = await db.query(
      'SELECT texto, respuestas, correcta FROM preguntas WHERE modulo_id = ?',
      [moduloId]
    );

    // Convertir a formato limpio
    const data = preguntas.map(p => {
      let opciones;
    
      try {
        opciones = typeof p.respuestas === 'string' ? JSON.parse(p.respuestas) : p.respuestas;
      } catch (e) {
        console.error("Error parseando respuestas:", p.respuestas);
        opciones = [];
      }
    
      return {
        pregunta: p.texto,
        opciones: opciones,
        correcta: p.correcta
      };
    });
    
    

    res.json(data);
  } catch (err) {
    console.error("Error al obtener preguntas:", err);
    res.status(500).json({ error: 'Error al obtener preguntas del módulo' });
  }
});

//get titulo del modulo
router.get('/modulos/:id/titulo', async (req, res) => {
  const moduloId = parseInt(req.params.id);

  try {
    const [result] = await db.query(
      'SELECT titulo FROM modulos WHERE id = ?',
      [moduloId]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    res.json({ titulo: result[0].titulo });
  } catch (err) {
    console.error("Error al obtener título del módulo:", err);
    res.status(500).json({ error: 'Error interno' });
  }
});


// Obtener un módulo completo por ID
router.get('/modulos/:id', async (req, res) => {
  const moduloId = parseInt(req.params.id);

  try {
    const [result] = await db.query(
      'SELECT * FROM modulos WHERE id = ?',
      [moduloId]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    res.json(result[0]);
  } catch (err) {
    console.error("Error al obtener módulo:", err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Obtener todos los módulos
router.get('/modulos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, titulo, contenido_html FROM modulos');
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener módulos:", err);
    res.status(500).json({ error: 'Error interno' });
  }
});

  

module.exports = router;