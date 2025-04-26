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
    try {
        const { cod, nombre, descripcion } = req.body;

        
        if (!cod || !nombre || !descripcion) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        
        const [existingCourse] = await db.query('SELECT * FROM cursos WHERE cod = ?', [cod]);
        if (existingCourse.length > 0) {
            return res.status(409).json({ message: 'El curso ya existe con esa clave.' });
        }

        
        await db.query('INSERT INTO cursos (cod, nombre, descripcion) VALUES (?, ?, ?)', [cod, nombre, descripcion]);

        
        const user_id = req.session.user.user_id;
        const [profesorData] = await db.query('SELECT id FROM profesores WHERE id_usuario = ?', [user_id]);

        if (profesorData.length === 0) {
            return res.status(404).json({ message: 'Profesor no encontrado' });
        }

        const id_profesor = profesorData[0].id;

        
        await db.query('INSERT INTO profesores_cursos (id_profesor, cod_curso) VALUES (?, ?)', [id_profesor, cod]);

        res.status(201).json({ message: 'Curso y asociación con profesor agregados exitosamente' });

    } catch (err) {
        console.error('Error al agregar curso:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/agregar_alumno', async (req, res) => {
    try {
        const { id_usuario, nombre, apellido, username, password } = req.body;

        // Validar campos
        if (!id_usuario || !nombre || !apellido || !username || !password) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        // Verificar si ya existe el alumno
        const [existingStudent] = await db.query('SELECT * FROM alumnos WHERE id_usuario = ?', [id_usuario]);
        if (existingStudent.length > 0) {
            return res.status(409).json({ message: 'Ya existe un alumno con ese ID.' });
        }

        // Insertar en la tabla usuarios, añadiendo 'rol' con el valor 'alumno'
        await db.query('INSERT INTO usuarios (id, hashing, salt, rol) VALUES (?, ?, ?, ?)', [id_usuario, username, password, 'alumno']);

        // Ahora que id_usuario existe en usuarios, insertamos en la tabla alumnos
        await db.query('INSERT INTO alumnos (id_usuario, nombre, apellido) VALUES (?, ?, ?)', [id_usuario, nombre, apellido]);

        res.status(201).json({ message: 'Alumno y usuario agregados exitosamente.' });
    } catch (err) {
        console.error('Error al agregar alumno:', err); // Detalle del error
        res.status(500).json({ error: err.message });
    }
});


router.get('/obtener_alumnos', async (req, res) => {
    try {
        const [results] = await db.query('SELECT id_usuario, nombre FROM alumnos');

        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron alumnos' });
        }

        const alumnos = results.map(alumno => ({
            id_usuario: alumno.id_usuario,
            nombre: alumno.nombre
        }));

        res.json(alumnos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




module.exports = router;