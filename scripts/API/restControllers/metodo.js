const db = require('../database/db');

async function getUserData(req, res) {
    const query = 'SELECT * FROM users WHERE userID = ?';
    const userID = req.params.id; // Assuming you send the ID in the URL

    db.query(query, [userID], (error, results) => {
        if (error) {
            res.status(500).send('Error retrieving data');
        } else {
            res.json(results);
        }
    });
}

async function getUserIDandPW(userID) {
    const query = 'SELECT * FROM users WHERE userID = ?';

    return new Promise((resolve, reject) => {
        db.query(query, [userID], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

module.exports = { getUserData, getUserIDandPW };