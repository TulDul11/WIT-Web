const db = require('../database/db');

async function checkUserIDandPW(userID, userPassword) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Usuario WHERE username = ? AND contrasena = ?', [userID, userPassword], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

async function getStudentData(userID) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Alumno WHERE usuario_id = ?', [userID], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

async function getTeacherData(userID) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Profesor WHERE usuario_id = ?', [userID], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

async function getStudentCourses(studentID) {
    return new Promise((resolve, reject) => {
        db.query('SELECT curso_id FROM Alumno_Cruso WHERE alumno_id = ?', [studentID], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

async function getTeacherCourses(teacherID) {
    return new Promise((resolve, reject) => {
        db.query('SELECT curso_id FROM Profesor_Cruso WHERE profesor_id = ?', [teacherID], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

async function getCourseData(courseID) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Curso WHERE curso_id = ?', [courseID], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

async function agregarCurso(studentID, courseClave) {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO Alumno_Cruso (alumno_id, curso_id) SELECT ?, curso_id FROM Curso WHERE curso_clave = ?', [studentID, courseClave], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

module.exports = { checkUserIDandPW, getStudentData, getTeacherData, getStudentCourses, getTeacherCourses, getCourseData, agregarCurso };