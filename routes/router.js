const express = require('express');
const bcrypt = require('bcrypt');
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

router.post('/login_info', async (req, res) => {
  try {
      const { user_id, user_password } = req.body;

      if (!user_id || !user_password) {
          return res.status(399).json({ message: 'Se requiere tanto el usuario como la contraseña.' });
      }

      const [results] = await db.query(`SELECT hashing, salt, rol FROM usuarios WHERE id = ?`, [user_id]);

      if (results.length == 0) {
          return res.status(404).json({
              message: 'Error: Usuario no encontrado'
          })
      } else {
          const hashed_password = await bcrypt.hash(user_password, results[0].salt);
          if (hashed_password != results[0].hashing) {
              return res.status(401).json({
                  message: 'Error: Contraseña incorrecta'
              })
          }
      } 
      const user_role = results[0].rol;

      req.session.user = {user_id: user_id, user_role: user_role};

      return res.json({
          user_info: {
              user_id: user_id,
              user_role: user_role
          }
      });
  } catch (err) {
      res.status(500).json({
          error: err.message
      });
  }
})

router.get('/logout', async (req, res) => {
  try {
      req.session.destroy((err) => {
          if (err) {
              return res.status(500).send('Failed to log out');
          }
      });
      res.json({ message: 'Logged out successfully' });
  } catch (err) {
      res.status(500).json({
          error: err.message
      });
  }
});

router.post('/user_home', async (req, res) => {
  try {
      if (!req.session.user) {
          return res.status(401).json({ message: 'Sesión expirada o no iniciada.' });
      }

      const user_id = req.session.user.user_id;

      const role_table = req.session.user.user_role == 'alumno' ? 'alumnos' : 'profesores';

      const query = `SELECT nombre, apellido FROM ${role_table} WHERE id_usuario = '${user_id}'`

      const [results] = await db.query(query);

      if (results.length == 0) {
          return res.status(404).json({
              message: 'Error: Usuario no encontrado'
          })
      }

      results[0].user_id = user_id;
      results[0].user_role = req.session.user.user_role;

      return res.json(results[0]);
  } catch (err) {
      res.status(500).json({
          error: err.message
      });
  }
})

router.post('/user_courses', async (req, res) => {
  try {
      if (!req.session.user) {
          return res.status(401).json({ message: 'Sesión expirada o no iniciada.' });
      }
      
      const { user_role, user_id} = req.body;

      const query = `SELECT id FROM ${user_role} WHERE id_usuario = '${user_id}'`

      const [current_user] = await db.query(query);

      if (current_user.length == 0) {
          return res.status(404).json({
              message: 'Error: Usuario no encontrado'
          })
      }

      let num_id = current_user[0].id;

      let course_codes_query;

      if (user_role == 'alumnos') {
          course_codes_query = `SELECT cod_curso FROM alumnos_cursos WHERE id_alumno = ${num_id}`
      } else if (user_role == 'profesores') {
          course_codes_query = `SELECT cod_curso FROM profesores_cursos WHERE id_profesor = ${num_id}`
      }

      const [courses_codes] = await db.query(course_codes_query);

      if (courses_codes.length == 0) {
          return res.status(404).json({
              message: 'No está inscrito en ningún curso.'
          })
      }

      let course_data = []

      for (let row of courses_codes) {
          let code_course = row.cod_curso;
          
          let course_query = `SELECT * FROM cursos WHERE cod = '${code_course}'`;

          const [course] = await db.query(course_query);

          if (course.length > 0) {
              course_data.push(course);
          }
      }

      return res.json({course_data: course_data})

  } catch (err) {
      res.status(500).json({
          error: err.message
      });
  }
})

router.post('/agregar_curso', async (req, res) => {
  try {
      const { cod, nombre, descripcion } = req.body;

      // Verificar si los campos están completos
      if (!cod || !nombre || !descripcion) {
          return res.status(400).json({ message: 'Faltan campos obligatorios' });
      }

      // Verifica si el curso ya existe en la base de datos
      const [existingCourse] = await db.query('SELECT * FROM cursos WHERE cod = ?', [cod]);
      if (existingCourse.length > 0) {
          return res.status(409).json({ message: 'El curso ya existe con esa clave.' });
      }

      // Agregar el curso a la base de datos
      await db.query('INSERT INTO cursos (cod, nombre, descripcion) VALUES (?, ?, ?)', [cod, nombre, descripcion]);

      // Retornar respuesta exitosa
      res.status(201).json({ message: 'Curso agregado exitosamente' });
  } catch (err) {
      console.error('Error al agregar curso:', err);
      res.status(500).json({ error: err.message });
  }
});

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
router.put('/modulos/:id', async (req, res) => {
  const moduloId = parseInt(req.params.id);
  const { titulo, contenido } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE modulos SET titulo = ?, contenido_html = ? WHERE id = ?',
      [titulo, contenido, moduloId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    res.json({ message: 'Módulo actualizado correctamente' });
  } catch (err) {
    console.error("Error al actualizar módulo:", err);
    res.status(500).json({ error: 'Error interno al actualizar' });
  }
});  

module.exports = router;