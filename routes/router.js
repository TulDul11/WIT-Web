const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../config/db');

/* Formato de router por query
Cambiar cualquier parte entre << >>

Router metodo get
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

Router metodo post
router.post('/', async (req, res) => {
    try {
        const {} = req.body;

    } catch (err) {

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
        const { id_usuario, nombre, apellido, username, password } = req.body;

        
        if (!id_usuario || !nombre || !apellido || !username || !password) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        
        const [existingStudent] = await db.query('SELECT * FROM alumnos WHERE id_usuario = ?', [id_usuario]);
        if (existingStudent.length > 0) {
            return res.status(409).json({ message: 'Ya existe un alumno con ese ID.' });
        }

        
        const [existingUser] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id_usuario]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Ya existe un usuario con ese ID.' });
        }

        
        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt);

        
        await db.query('INSERT INTO usuarios (id, hashing, salt, rol) VALUES (?, ?, ?, ?)', [id_usuario, hashedPassword, salt, 'alumno']);

        
        await db.query('INSERT INTO alumnos (id_usuario, nombre, apellido) VALUES (?, ?, ?)', [id_usuario, nombre, apellido]);

        res.status(201).json({ message: 'Alumno y usuario agregados exitosamente.' });
    } catch (err) {
        console.error('Error al agregar alumno:', err); 
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
    console.log('Endpoint /agregar_alumno_curso accedido con:', req.body);
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

        console.log(`Inserción exitosa para id_alumno: ${id_alumno} en cod_curso: ${cod_curso}`);
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




module.exports = router;