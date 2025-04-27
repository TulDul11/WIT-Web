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

        return;
        
    } catch (err) {
        // Caso: Error de conexión
        res.status(500) .json({message: 'Error al iniciar sesión. Intente más tarde.'})
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

module.exports = router;