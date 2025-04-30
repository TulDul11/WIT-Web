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
Método POST para cambiar el curso previo.
*/
router.post('/previous_course', async (req, res) => {
  try {
      const {cod} = req.body;

      if (!req.session.user) {
          return res.status(401).json({ message: 'Sesión expirada o no iniciada.' });
      }

      const user_id = req.session.user.user_id;

      const query = `SELECT cod_curso FROM usuarios_cursos_previos WHERE id_usuario = '${user_id}'`
      const [results] = await db.query(query);

      if (results.length != 0) {
          const query = `DELETE FROM usuarios_cursos_previos WHERE id_usuario = '${user_id}'`
          await db.query(query);
      }

      const insert_query = `INSERT INTO usuarios_cursos_previos (id_usuario, cod_curso) VALUES ('${user_id}', '${cod}')`
      const [insert_result] = await db.query(insert_query);

      return res.json(insert_result);

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
                // Caso: No se encontró el usuario.
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

// Obtener la información de los cursos del usuario
router.post('/user_courses', async (req, res) => {
  try {
      if (!req.session.user) {
          return res.status(401).json({ message: 'Sesión expirada o no iniciada.' });
      }

      const { user_role, user_id, cod } = req.body;

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
          if (!cod) {
              course_codes_query = `SELECT cod_curso FROM alumnos_cursos WHERE id_alumno = ${num_id}`;
          } else {
              course_codes_query = `SELECT cod_curso FROM alumnos_cursos WHERE id_alumno = ${num_id} AND cod_curso = '${cod}'`;
          }
      } else if (user_role == 'profesores') {
          if (!cod) {
              course_codes_query = `SELECT cod_curso FROM profesores_cursos WHERE id_profesor = ${num_id}`;
          } else {
              course_codes_query = `SELECT cod_curso FROM profesores_cursos WHERE id_profesor = ${num_id} AND cod_curso = '${cod}'`;
          }
      }

      const [courses_codes] = await db.query(course_codes_query);

      if (courses_codes.length == 0) {
          return res.status(404).json({
              message: 'No está inscrito en ningún curso.'
          })
      }

      let course_data = [];

      for (let row of courses_codes) {
          let code_course = row.cod_curso;

          let course_query = `SELECT * FROM cursos WHERE cod = '${code_course}'`;

          const [course] = await db.query(course_query);

          if (course.length > 0) {
              course_data.push(course);
          }
      }

      return res.json({ course_data: course_data })

  } catch (err) {
      res.status(500).json({
          error: err.message
      });
  }
})

// obtener tareas de un curso
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

router.post('/dashboard', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Sesión expirada o no iniciada.' });
    }

    const {user_id, user_role, cod} = req.body;

    let query = `SELECT id FROM ${user_role} WHERE id_usuario = '${user_id}'`;

    const [current_user] = await db.query(query);

    if (current_user.length == 0) {
      return res.status(404).json({
          message: 'Error: Usuario no encontrado'
      })
    }

    let num_id = current_user[0].id;

    query = `SELECT nombre FROM cursos WHERE cod = '${cod}';`

    const [course] = await db.query(query);

    let dashboard_data = [];
    dashboard_data.push(course[0].nombre);

    query = `SELECT COUNT(*) AS num_alumnos FROM alumnos_cursos WHERE cod_curso = '${cod}';`;

    const [alumnos] = await db.query(query);

    dashboard_data.push(alumnos[0].num_alumnos);

    query = `SELECT nombre FROM alumnos_cursos
            INNER JOIN alumnos ON alumnos.id = alumnos_cursos.id_alumno 
            WHERE cod_curso = '${cod}';`;

    const [nombres] = await db.query(query);

    let progress = [];

    for (let name of nombres){
        let nombre = name.nombre;
        query = `SELECT * FROM (SELECT count(*) AS tareas FROM alumnos_tareas 
                INNER JOIN alumnos ON alumnos_tareas.id_alumno = alumnos.id
                INNER JOIN modulos ON alumnos_tareas.id_tarea = modulos.id
                WHERE nombre = '${nombre}' AND cod_curso = '${cod}') AS A
                JOIN (SELECT COUNT(*) AS tareas_completadas FROM alumnos_tareas 
                INNER JOIN alumnos ON alumnos_tareas.id_alumno = alumnos.id
                INNER JOIN modulos ON alumnos_tareas.id_tarea = modulos.id
                WHERE nombre = '${nombre}' AND completado = true AND cod_curso = '${cod}') AS B;`;
        let [tareas] = await db.query(query);
        progress.push({nombre: nombre, tareas: tareas[0].tareas, tareas_completadas: tareas[0].tareas_completadas});
    }
    dashboard_data.push(progress);

    query = `SELECT COUNT(*) AS num_modulos FROM modulos WHERE cod_curso = '${cod}';`;
    const [modulos] = await db.query(query);

    dashboard_data.push(modulos[0].num_modulos);

    let calificaciones = [];

    query = `SELECT id_alumno FROM alumnos_cursos WHERE cod_curso = '${cod}';`;
    const [alumnos_id] = await db.query(query);
    let i = 0;
    for(let name of nombres){
        query = `SELECT AVG(resultado) AS promedio FROM alumnos_tareas
        INNER JOIN alumnos ON alumnos_tareas.id_alumno = alumnos.id
        INNER JOIN modulos ON alumnos_tareas.id_tarea = modulos.id
        WHERE alumnos.id = ${alumnos_id[i].id_alumno} AND cod_curso = '${cod}';`;
        let [promedio] = await db.query(query);
        calificaciones.push({nombre: name.nombre, promedio: promedio[0].promedio});
        i++;
    }
    dashboard_data.push(calificaciones);

    return res.json(dashboard_data);


  }catch (err) {
    res.status(500).json({
        error: err.message
    });
  }
});

router.post('/progreso', async (req, res) => {
  try{
    if (!req.session.user) {
      return res.status(401).json({ message: 'Sesión expirada o no iniciada.' });
    }
    const {user_id, user_role, cod} = req.body;

    let query = `SELECT id FROM ${user_role} WHERE id_usuario = '${user_id}'`;

    const [current_user] = await db.query(query);

    if (current_user.length == 0) {
      return res.status(404).json({
          message: 'Error: Usuario no encontrado'
      })
    }

    let num_id = current_user[0].id;

    query = `SELECT * FROM (SELECT COUNT(*) AS tareas FROM alumnos_tareas 
            INNER JOIN modulos ON alumnos_tareas.id_tarea = modulos.id
            WHERE id_alumno = ${num_id}) AS A
            JOIN (SELECT COUNT(*) AS tareas_completadas FROM alumnos_tareas 
            INNER JOIN modulos ON alumnos_tareas.id_tarea = modulos.id
            WHERE id_alumno = ${num_id} AND completado) AS B;`

    let [tareas] = await db.query(query);

    console.log(tareas);

    return res.json({tareas: tareas[0].tareas, tareas_completadas: tareas[0].tareas_completadas});

  }catch{
    res.status(500).json({
        error: err.message
    });
  }
})


//guardar contenido del modulo
router.post('/modulos', async (req, res) => {
    const { titulo, contenido, tarea, cod_curso, fecha_entrega} = req.body;
  
    try {
      const [result] = await db.query(
        'INSERT INTO modulos (titulo, contenido_html, tarea, cod_curso, fecha_entrega) VALUES (?, ?, ?, ?, ?)',
        [titulo, contenido, tarea, cod_curso, fecha_entrega]
      );
  
      res.json({ moduloId: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al guardar el módulo' });
    }
})
  

// Ruta para guardar las preguntas asociadas al módulo
router.post('/modulos/:id/preguntas', async (req, res) => {
  const moduloId = req.params.id;
  const { preguntas } = req.body;

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [deleteResult] = await conn.query('DELETE FROM preguntas WHERE modulo_id = ?', [moduloId]);

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
    res.json({ message: 'Preguntas actualizadas correctamente' });

  } catch (err) {
    await conn.rollback();
    console.error(">>> ERROR:", err);
    res.status(500).json({ error: 'Error al actualizar preguntas' });
  } finally {
    conn.release();
  }
})

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
})

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
})


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

// Filtrar modulos por curso 
router.get('/modulos', async (req, res) => {
  const { cod } = req.query; // Leer el parámetro cod de la URL

  try {
    let rows;

    if (cod) {
      // ⚡ Si viene cod, filtrar por curso
      [rows] = await db.query('SELECT id, titulo, contenido_html FROM modulos WHERE cod_curso = ?', [cod]);
    } else {
      // ⚡ Si no viene cod, traer todos
      [rows] = await db.query('SELECT id, titulo, contenido_html FROM modulos');
    }

    res.json(rows);
  } catch (err) {
    console.error("Error al obtener módulos:", err);
    res.status(500).json({ error: 'Error interno' });
  }
})

router.put('/modulos/:id', async (req, res) => {
  const moduloId = parseInt(req.params.id);
  const {  titulo, contenido, tarea, cod_curso, fecha_entrega } = req.body;

  try {
    const [result] = await db.query(`
      UPDATE modulos 
      SET titulo = ?, contenido_html = ?, tarea = ?, cod_curso = ?, fecha_entrega = ?
      WHERE id = ?`, 
      [titulo, contenido, tarea, cod_curso, fecha_entrega, moduloId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    res.json({ message: 'Módulo actualizado correctamente' });
  } catch (err) {
    console.error("Error al actualizar módulo:", err);
    res.status(500).json({ error: 'Error interno al actualizar' });
  }
})

router.delete('/modulos/:id', async (req, res) => {
  const moduloId = req.params.id;

  try {
      const [result] = await db.query('DELETE FROM modulos WHERE id = ?', [moduloId]);

      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Módulo no encontrado' });
      }

      res.json({ message: 'Módulo eliminado correctamente' });
  } catch (err) {
      console.error("Error al eliminar módulo:", err);
      res.status(500).json({ error: 'Error interno al eliminar' });
  }
})

router.post('/guardar_resultado', async (req, res) => {
  const { user_id, id_tarea, resultado, completado } = req.body;

  console.log('Datos recibidos en guardar_resultado:', { user_id, id_tarea, resultado, completado });

  if (!user_id || id_tarea == null || resultado == null || completado == null) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }

  try {
    const updateQuery = `
      UPDATE alumnos_tareas 
      SET resultado = ?, completado = ?
      WHERE id_alumno = (SELECT id FROM alumnos WHERE id_usuario = ?)
      AND id_tarea = ?;`;

    console.log('Query que se ejecutará:', updateQuery);
    console.log('Con valores:', [resultado, completado, user_id, id_tarea]);

    const [result] = await db.query(updateQuery, [resultado, completado, user_id, id_tarea]);

    console.log('Resultado de db.query:', result);

    res.status(200).json({ message: 'Resultado actualizado exitosamente' });
  } catch (error) {
    console.error('Error en guardar_resultado:', error);
    res.status(500).json({ message: 'Error interno al guardar el resultado', error: error.message });
  }
});




// ROUTER PROFESOR 
router.post('/agregar_curso', async (req, res) => {
  const connection = await db.getConnection();
  try {
      await connection.beginTransaction();
      
      const { cod, nombre, descripcion, alumnos } = req.body;
      if (!cod || !nombre || !descripcion) {
          return res.status(400).json({ message: 'Faltan campos obligatorios' });
      }
      
      const [existingCourse] = await connection.query('SELECT * FROM cursos WHERE cod = ?', [cod]);
      if (existingCourse.length > 0) {
          return res.status(409).json({ message: 'El curso ya existe con esa clave.' });
      }
      
      await connection.query('INSERT INTO cursos (cod, nombre, descripcion) VALUES (?, ?, ?)', [cod, nombre, descripcion]);
      
      // Asociación al profesor (suponiendo que ya tienes el id del profesor)
      const user_id = req.session.user.user_id;
      const [profesorData] = await connection.query('SELECT id FROM profesores WHERE id_usuario = ?', [user_id]);
      if (profesorData.length === 0) {
          return res.status(404).json({ message: 'Profesor no encontrado' });
      }
      const id_profesor = profesorData[0].id;
      await connection.query('INSERT INTO profesores_cursos (id_profesor, cod_curso) VALUES (?, ?)', [id_profesor, cod]);
      
      // Inserción de alumnos en alumnos_cursos
      if (alumnos && Array.isArray(alumnos)) {
          for (let id_alumno of alumnos) {
              await connection.query(
                  'INSERT INTO alumnos_cursos (id_alumno, cod_curso) VALUES (?, ?)',
                  [id_alumno, cod]
              );
          }
      }
      
      await connection.commit();
      res.status(201).json({ message: 'Curso y asociaciones creados exitosamente.' });
  } catch (err) {
      await connection.rollback();
      console.error('Error en inserción en transacción:', err);
      res.status(500).json({ error: err.message });
  } finally {
      connection.release();
  }
});


router.post('/agregar_alumno', async (req, res) => {
    try {
      const { alumnos } = req.body;
  
      if (!Array.isArray(alumnos) || alumnos.length === 0) {
        return res.status(400).json({ message: 'No hay alumnos válidos.' });
      }
  
      const agregados = [];
      const duplicados = [];
  
      for (const alumno of alumnos) {
        const { id_usuario, nombre, apellido, username, password } = alumno;
  
        // Validar campos individuales
        if (!id_usuario || !nombre || !apellido || !username || !password) {
          continue;
        }
  
        const [existingStudent] = await db.query('SELECT * FROM alumnos WHERE id_usuario = ?', [id_usuario]);
        const [existingUser] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id_usuario]);
  
        if (existingStudent.length > 0 || existingUser.length > 0) {
          duplicados.push(id_usuario);
          continue;
        }
  
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
  
        await db.query('INSERT INTO usuarios (id, hashing, salt, rol) VALUES (?, ?, ?, ?)', [id_usuario, hashedPassword, salt, 'alumno']);
        await db.query('INSERT INTO alumnos (id_usuario, nombre, apellido) VALUES (?, ?, ?)', [id_usuario, nombre, apellido]);
  
        agregados.push(id_usuario);
      }
  
      res.status(201).json({ message: 'Proceso completado.', agregados, duplicados });
  
    } catch (err) {
      console.error('Error al agregar alumnos:', err);
      res.status(500).json({ error: err.message });
    }
});
  


router.get('/obtener_alumnos', async (req, res) => {
  try {
      const [results] = await db.query('SELECT id, nombre FROM alumnos');

      if (results.length === 0) {
          return res.status(404).json({ message: 'No se encontraron alumnos' });
      }

      const alumnos = results.map(alumno => ({
          id: alumno.id,
          nombre: alumno.nombre
      }));

      res.json(alumnos);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

router.post('/delete_course', async (req, res) => {
  let connection; // Declarar la conexión fuera del bloque try para que sea accesible en finally

  try {
      const { course_id } = req.body;

      if (!course_id) {
          return res.status(400).json({ message: 'El ID del curso es necesario' });
      }

      // Obtener conexión a la base de datos
      connection = await db.getConnection();
      await connection.beginTransaction();

      // Paso 1: Eliminar registros dependientes en la tabla profesores_cursos
      const deleteProfessorsCoursesQuery = `DELETE FROM profesores_cursos WHERE cod_curso = ?`;
      await connection.query(deleteProfessorsCoursesQuery, [course_id]);

      // Paso 2: Eliminar registros dependientes en la tabla alumnos_cursos
      const deleteStudentsCoursesQuery = `DELETE FROM alumnos_cursos WHERE cod_curso = ?`;
      await connection.query(deleteStudentsCoursesQuery, [course_id]);

      // Paso 3: Eliminar el curso de la tabla cursos
      const deleteCourseQuery = `DELETE FROM cursos WHERE cod = ?`;
      const [result] = await connection.query(deleteCourseQuery, [course_id]);

      if (result.affectedRows > 0) {
          await connection.commit();
          res.json({ message: 'Curso eliminado exitosamente' });
      } else {
          await connection.rollback();
          res.status(404).json({ message: 'Curso no encontrado' });
      }

  } catch (err) {
      if (connection) await connection.rollback(); // Solo hacer rollback si connection existe
      console.error('Error al eliminar el curso:', err);
      res.status(500).json({ message: 'Error al eliminar el curso', error: err.message });

  } finally {
      if (connection) connection.release(); // Evitar ReferenceError
  }
});


router.post('/agregar_alumno_curso', async (req, res) => {
  try {
      const { id_alumno, cod_curso } = req.body;
      if (!id_alumno || !cod_curso) {
          return res.status(400).json({ message: 'Faltan campos obligatorios' });
      }

      const [existingAssociation] = await db.query(
          'SELECT * FROM alumnos_cursos WHERE id_alumno = ? AND cod_curso = ?',
          [id_alumno, cod_curso]
      );

      if (existingAssociation.length > 0) {
          return res.status(409).json({ message: 'El alumno ya está asignado a este curso.' });
      }

      await db.query(
          'INSERT INTO alumnos_cursos (id_alumno, cod_curso) VALUES (?, ?)',
          [id_alumno, cod_curso]
      );

      res.status(201).json({ message: 'Alumno asignado al curso exitosamente.' });
  } catch (err) {
      console.error('Error al asignar el alumno al curso:', err);
      res.status(500).json({ error: err.message });
  }
});

router.get('/obtener_curso', async (req, res) => {
  const connection = await db.getConnection();
  try {
      const { cod } = req.query;
      if (!cod) {
          return res.status(400).json({ message: 'Código de curso requerido.' });
      }

      const [curso] = await connection.query('SELECT * FROM cursos WHERE cod = ?', [cod]);
      if (curso.length === 0) {
          return res.status(404).json({ message: 'Curso no encontrado.' });
      }

      res.status(200).json(curso[0]);
  } catch (err) {
      console.error('Error al obtener curso:', err);
      res.status(500).json({ error: err.message });
  } finally {
      connection.release();
  }
});

router.post('/tarea_id', async (req, res) => {
  const { user_id, user_role, moduloID } = req.body;

  try {
    const [alumno] = await db.query('SELECT id FROM alumnos WHERE id_usuario = ?', [user_id]);
    if (alumno.length === 0) return res.status(404).json({ message: 'Alumno no encontrado' });

    const id_alumno = alumno[0].id;

    const [tarea] = await db.query('SELECT id_tarea FROM alumnos_tareas WHERE id_alumno = ? AND id_tarea = ?', [id_alumno, moduloID]);

    if (tarea.length === 0) return res.status(404).json({ message: 'Tarea no encontrada' });

    res.json({ id_tarea: tarea[0].id_tarea });
  } catch (error) {
    console.error('Error al obtener id_tarea:', error);
    res.status(500).json({ message: 'Error interno' });
  }
});


router.get('/alumnos_del_curso/:cod_curso', async (req, res) => {
    const { cod_curso } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT alumnos.id AS id, alumnos.nombre AS nombre
            FROM alumnos
            INNER JOIN alumnos_cursos ON alumnos.id = alumnos_cursos.id_alumno
            WHERE alumnos_cursos.cod_curso = ?
        `, [cod_curso]);

        res.status(200).json(rows);
    } catch (err) {
        console.error('Error al obtener los alumnos del curso:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/descripcion_del_curso/:cod_curso', async (req, res) => {
    const { cod_curso } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT descripcion
            FROM cursos
            WHERE cod = ?
        `, [cod_curso]);

        console.log('Resultado de la consulta:', rows); // Agrega este log

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        res.status(200).json({ descripcion: rows[0].descripcion });
    } catch (err) {
        console.error('Error al obtener la descripción del curso:', err);
        res.status(500).json({ error: err.message });
    }
});





router.put('/actualizar_alumnos_curso/:codCurso', async (req, res) => {
    let connection;

    try {
        const codCurso = req.params.codCurso;
        const { alumnos } = req.body;

        if (!Array.isArray(alumnos)) {
            return res.status(400).json({ message: 'Se requiere un arreglo de IDs de alumnos' });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Paso 1: Eliminar registros actuales en alumnos_cursos para este curso
        const deleteQuery = `DELETE FROM alumnos_cursos WHERE cod_curso = ?`;
        await connection.query(deleteQuery, [codCurso]);

        // Paso 2: Insertar nuevos registros con id_alumno
        const insertQuery = `INSERT INTO alumnos_cursos (cod_curso, id_alumno) VALUES (?, ?)`;

        for (const alumnoId of alumnos) {
            await connection.query(insertQuery, [codCurso, alumnoId]);
        }

        await connection.commit();
        res.json({ message: 'Alumnos actualizados exitosamente' });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Error al actualizar alumnos del curso:', err);
        res.status(500).json({ message: 'Error al actualizar alumnos del curso', error: err.message });

    } finally {
        if (connection) connection.release();
    }
});

router.put('/actualizar_descripcion_curso/:codCurso', async (req, res) => {
    const codCurso = req.params.codCurso;
    const { descripcion } = req.body;

    if (typeof descripcion !== 'string') {
        return res.status(400).json({ message: 'La descripción debe ser una cadena de texto' });
    }

    try {
        const [result] = await db.query(`
            UPDATE cursos
            SET descripcion = ?
            WHERE cod = ?
        `, [descripcion, codCurso]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        res.json({ message: 'Descripción del curso actualizada exitosamente' });
    } catch (err) {
        console.error('Error al actualizar la descripción del curso:', err);
        res.status(500).json({ message: 'Error al actualizar la descripción del curso', error: err.message });
    }
});




module.exports = router;