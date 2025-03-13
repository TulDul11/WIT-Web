const express = require('express');
const { checkUserIDandPW, getStudentData, getTeacherData, getStudentCourses, getTeacherCourses, getCourseData, agregarCurso, crearCurso, linkCurso} = require('../restControllers/metodo'); 
const router = express.Router();

router.post('/login', async (req, res) => {
    const { userID, userPassword } = req.body;
    try {
        const result = await checkUserIDandPW(userID, userPassword); 
        if (result.length > 0) {
            res.json({success: true, data:result});
        } else {
            res.status(404).json({success: false, message:"Usuario no encontrado" });
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

router.post('/student_data', async (req, res) => {
    const { userID} = req.body;
    try {
        const result = await getStudentData(userID); 
        if (result.length > 0) {
            res.json({success: true, data:result});
        } else {
            res.status(404).json({success: false, message:"Usuario no encontrado" });
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

router.post('/teacher_data', async (req, res) => {
    const { userID} = req.body;
    try {
        const result = await getTeacherData(userID); 
        if (result.length > 0) {
            res.json({success: true, data:result});
        } else {
            res.status(404).json({success: false, message:"Usuario no encontrado" });
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

router.post('/student_course', async (req, res) => {
    const { studentID } = req.body;
    try {
        const result = await getStudentCourses(studentID); 
        if (result.length > 0) {
            res.json({success: true, data:result});
        } else {
            res.status(404).json({success: false, message:"Datos no encontrados" });
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

router.post('/teacher_course', async (req, res) => {
    const { teacherID } = req.body;
    try {
        const result = await getTeacherCourses(teacherID); 
        if (result.length > 0) {
            res.json({success: true, data:result});
        } else {
            res.status(404).json({success: false, message:"Datos no encontrados" });
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

router.post('/course_data', async (req, res) => {
    const { courseID } = req.body;
    try {
        const result = await getCourseData(courseID); 
        if (result.length > 0) {
            res.json({success: true, data:result});
        } else {
            res.status(404).json({success: false, message:"Datos no encontrados" });
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

router.post('/register_course', async (req, res) => {
    const { studentID, courseClave } = req.body;
    try {
        const result = await agregarCurso(studentID, courseClave); 
        if (result.length > 0) {
            res.json({success: true, data:result});
        } else {
            res.status(404).json({success: false, message:"Datos no encontrados" });
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

router.post('/create_course', async (req, res) => {
    const { courseName, courseDesc, courseClave } = req.body;
    try {
        const result = await crearCurso(courseName, courseDesc, courseClave); 
        res.json({success: true, data:result});
    } catch (error) {
        console.error("Error:", error);
    }
});

router.post('/link_course', async (req, res) => {
    const { teacherID, courseClave } = req.body;
    try {
        const result = await linkCurso(teacherID, courseClave); 
        res.json({success: true, data:result});
    } catch (error) {
        console.error("Error:", error);
    }
});

module.exports = router;