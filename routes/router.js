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
        const [results] = await db.query('SELECT contrasena FROM usuarios WHERE id = ?', [user_id]);

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

module.exports = router;