const express = require('express');
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

        const [results] = await db.query(`SELECT contrasena, rol FROM usuarios WHERE id = ?`, [user_id]);

        if (results.length == 0) {
            return res.status(404).json({
                message: 'Error: Usuario no encontrado'
            })
        } else if (user_password != results[0].contrasena) {
            return res.status(401).json({
                message: 'Error: Contraseña incorrecta'
            })
        }

        req.session.user = user_id;

        const user_role = results[0].rol;

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

router.get('/session', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'No se ha iniciado sesión' });
    } else {
        return res.status(200).json({ message: 'Bienvenido al home', user: req.session.user });
    }
});

router.post('/user_home', async (req, res) => {
    try {
        const { user_id, role_table } = req.body;

        const query = `SELECT nombre, apellido FROM ${role_table} WHERE id_usuario = '${user_id}'`

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


router.get('/config', (req, res) => {
    res.json({ api_url: process.env.API_URL || 'http://localhost:3000' });
});

module.exports = router;