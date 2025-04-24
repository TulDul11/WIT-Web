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
            if (user_role == 'alumnos') {
                course_codes_query = `SELECT cod_curso FROM alumnos_cursos WHERE id_alumno = ${num_id}`
            } else if (user_role == 'profesores') {
                course_codes_query = `SELECT cod_curso FROM profesores_cursos WHERE id_profesor = ${num_id}`
            }
        }else{
            if (user_role == 'alumnos') {
                course_codes_query = `SELECT cod_curso FROM alumnos_cursos WHERE id_alumno = ${num_id} AND cod_curso = '${cod}'`
            } else if (user_role == 'profesores') {
                course_codes_query = `SELECT cod_curso FROM profesores_cursos WHERE id_profesor = ${num_id} AND cod_curso = '${cod}'`
            }
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

        homework_query = `SELECT titulo FROM alumnos_tareas 
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
            homework_data.push(row.titulo);
        }

        return res.json({homework_data: homework_data})


    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
})

module.exports = router;