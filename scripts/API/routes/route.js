const express = require('express');
const { getUserData, getUserIDandPW } = require('../restControllers/metodo'); 
const router = express.Router();

router.get('/user/:id', getUserData);

router.post('/login', async (req, res) => {
    const { userID } = req.body;
    try {
        const result = await getUserIDandPW(userID); 
        if (result.length > 0) {
            res.json({ success: true, data: result });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Error retrieving data" });
    }
});

module.exports = router;