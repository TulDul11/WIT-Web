const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../config/db');

/*
Método POST para iniciar sesión.
Cuerpo: Usuario, Contraseña.
*/
router.post('/login_info', async (req, res) => { 
    try {
        // Conseguimos los datos del cuerpo
        const { user_id, user_password } = req.body;

        // Checamos si el campo de usuario o de contraseña están vacios.
        if (!user_id || !user_password) {
            // Caso: No hay usuario, contraseña o ambos.
            return res.status(399).json({message: 'Se requiere tanto el usuario como la contraseña.'});
        }

        // Query con la base de datos donde conseguimos los datos del usuario.
        const [results] = await db.query(`SELECT hashing, salt, rol FROM usuarios WHERE id = ?`, [user_id]);

        // Si los resultados están vacíos, significa que no hubo usuario.
        if (results.length == 0) {
            // Caso: No se encontró el usuario.
            return res.status(404).json({message: 'El usuario no ha sido encontrado'}); 

        } else {
            // Utilizando los datos conseguidos de la base de datos, encriptamos la contraseña proporcionada
            const hashed_password = await bcrypt.hash(user_password, results[0].salt);

            // Comparamos la contraseña proporcionada y encriptada con la contraseña encriptada de la base de datos.
            // Si no son iguales significa que la contraseña es incorrecta.
            if (hashed_password != results[0].hashing) {
                // Caso: La contraseña es incorrecta.
                return res.status(401).json({message: 'La contraseña es incorrecta'}); 
            }
        }
        
        // Si se pasaron todas las pruebas anteriores, podemos organizar nuestros datos y mandarlos.
        const user_role = results[0].rol;

        // Guardamos nuestros datos en una sesión (guardada en base de datos y cookies).
        req.session.user = {user_id: user_id, user_role: user_role};

        return res.json({
            user_info: {
                user_id: user_id,
                user_role: user_role
            }
        });
        
    } catch (err) {
        // Caso: Error de conexión
        res.status(500).json({message: 'Error al iniciar sesión. Intente más tarde.'})
    }
})

/*
Método GET para cerrar sesión.
*/
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

/*
Método POST para carga datos de la barra lateral.
*/
router.post('/sidebar', async (req, res) => {
    try {
        // Checamos si se ha iniciado sesión.
        if (!req.session.user) {
            // Caso: No se ha iniciado sesión. Mandamos error.
            return res.status(401).json({ message: 'Sesión expirada o no iniciada.' });
        }

        // El inicio de sesión está confirmado. Conseguimos los datos del usuario (usuario y rol).
        const user_id = req.session.user.user_id;
        const role_table = req.session.user.user_role == 'alumno' ? 'alumnos' : 'profesores';

        // Conseguimos el id de usuario dentro de MySQL (diferente al Usuario que se utiliza para ingresar)
        let query = `SELECT id FROM ${role_table} WHERE id_usuario = '${user_id}'`
        const [current_user] = await db.query(query);

        if (current_user.length == 0) {
            return res.status(404).json({
                // Caso: No se encontró el usuario.
                message: 'Error: Usuario no encontrado'
            })
        }

        const num_id = current_user[0].id;

        // Query para conseguir los cursos del usuario.
        // Query está hecho de está forma para poder hacer el query en diferentes tablas.
        query = `SELECT cod_curso FROM ${role_table}_cursos WHERE id_${req.session.user.user_role} = ${num_id}`;
        const [courses] = await db.query(query);

        let course_data = [];

        // Caso: Checamos si el usuario está en un curso o no.
        if (courses.length != 0) {

            for (const row of courses) {
                const code_course = row.cod_curso;
            
                const query = `SELECT cod, nombre, descripcion FROM cursos WHERE cod = '${code_course}'`;
                const [course] = await db.query(query);
            
                if (course.length > 0) {
                    course_data.push(course[0]);
                }
            }
        }

        // Query para abrir el curso previamente.
        query = `SELECT cod_curso FROM usuarios_cursos_previos WHERE id_usuario = '${user_id}'`;
        const [previous_course_cod] = await db.query(query);

        let data;

        // Caso: Si no se ha abierto un curso.
        if (previous_course_cod.length == 0) {
            const previous_course = 'Abre tu primer curso!';

            data = {
                user_role: req.session.user.user_role,
                course_data: course_data,
                previous_course: previous_course
            }
        } else {
            query = `SELECT cod, nombre FROM cursos WHERE cod = '${previous_course_cod[0].cod_curso}'`;
            const [previous_course] = await db.query(query);
        
            data = {
                user_role: req.session.user.user_role,
                course_data: course_data,
                previous_course: previous_course[0]
            }
        }

        return res.json(data);

    } catch (err) {
        // Caso: Error de conexión
        res.status(500).json({
            error: err.message
        });
    }
})

/*
Método POST para cargar datos de la página de inicio.
*/
router.post('/user_home', async (req, res) => {
    try {

        // Checamos si se ha iniciado sesión.
        if (!req.session.user) {
            // Caso: No se ha iniciado sesión. Mandamos error.
            return res.status(401).json({ message: 'Sesión expirada o no iniciada.' });
        }

        // El inicio de sesión está confirmado. Conseguimos los datos del usuario (usuario y rol).
        const user_id = req.session.user.user_id;
        const role_table = req.session.user.user_role == 'alumno' ? 'alumnos' : 'profesores';

        // Query para conseguir datos de usuario.
        // Query está hecho de está forma para poder hacer el query en diferentes tablas.
        const query = `SELECT nombre, apellido FROM ${role_table} WHERE id_usuario = '${user_id}'`
        const [results] = await db.query(query);

        // Caso: Si no se encuentra el usuario.
        if (results.length == 0) {
            return res.status(404).json({
                message: 'Error: Usuario no encontrado'
            })
        }

        // A los datos que conseguimos del query (nombre y apellido de usuario) le adjuntamos los datos de usuario y rol.
        results[0].user_id = user_id;
        results[0].user_role = req.session.user.user_role;

        return res.json(results[0]);

    } catch (err) {
        // Caso: Error de conexión
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
        
        const { user_role, user_id, cod} = req.body;

        const query = `SELECT id FROM ${user_role} WHERE id_usuario = '${user_id}'`

        const [current_user] = await db.query(query);


        if (current_user.length == 0) {
            return res.status(404).json({
                message: 'Error: Usuario no encontrado'
            })
        }

        let num_id = current_user[0].id;

        let course_codes_query;

        if(!cod) {
          course_codes_query = `SELECT cod_curso FROM ${user_role}_cursos WHERE id_alumno = ${num_id}`
        }else{
          course_codes_query = `SELECT cod_curso FROM ${user_role}_cursos WHERE id_alumno = ${num_id} AND cod_curso = '${cod}'`
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

router.post('/user_homework', async (req, res) => {
    try{
        if (!req.session.user) {
            return res.status(401).json({ message: 'Sesión expirada o no iniciada.' });
        }

        const {user_role, user_id, cod} = req.body;

        const query = `SELECT id FROM ${user_role} WHERE id_usuario = '${user_id}'`;

        const [current_user] = await db.query(query);


        if (current_user.length == 0) {
            return res.status(404).json({
                message: 'Error: Usuario no encontrado'
            })
        }

        let num_id = current_user[0].id;
        let homework_query;

        homework_query = `SELECT fecha_entrega, id_tarea, titulo FROM alumnos_tareas 
                        INNER JOIN modulos ON alumnos_tareas.id_tarea = modulos.id  
                        WHERE id_alumno = ${num_id} AND cod_curso = '${cod}' AND NOT completado
                        ORDER BY fecha_entrega
                        LIMIT 4`;
        
                
        const [homework] = await db.query(homework_query);

        if (homework.length == 0) {
            return res.status(404).json({
                message: 'No hay tareas asignadas.'
            })
        }

        let homework_data = []; 

        for (let row of homework) {
            homework_data.push(row);
        }

        return res.json(homework_data)


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

router.post('/guardar_xp', async (req, res) => {
  const { user_id, xp, resultado } = req.body;

  try {
    const [alumno] = await db.query('SELECT id FROM alumnos WHERE id_usuario = ?', [user_id]);

    if (alumno.length === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    await db.query(
      'UPDATE alumnos SET xp = ?, resultado = ? WHERE id_usuario = ?',
      [xp, resultado, user_id]
    );

    res.json({ message: 'XP y resultado guardados correctamente' });
  } catch (err) {
    console.error('Error al guardar XP:', err);
    res.status(500).json({ error: 'Error interno al guardar XP' });
  }
});


module.exports = router;