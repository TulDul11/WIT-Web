var user_type_id = ''

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
window.addEventListener('DOMContentLoaded', function() {
    const userInfo = JSON.parse(this.sessionStorage.getItem('userInfo'));
    const userType = userInfo.tipo;
    const userID = userInfo.usuario_id;

    if (userType == 'Alumno') {
        const alumnoScreen = document.getElementById('alumno_screen');
        alumnoScreen.style.display = 'flex';
        
        fetch('http://localhost:3001/student_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userID: userID
            })
        })
        .then(response => {
            if (!response.ok) {
                console.error("Error consiguiendo datos:", error);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                setUpAlumnoScreen(data.data[0]);
            } else {
                console.log("Datos no encontrados");
            }
        })
        .catch(error => {
            console.error("Error consiguiendo datos:", error);
        });

    } else if (userType == 'Profesor') {
        const profesorScreen = document.getElementById('profesor_screen');
        profesorScreen.style.display = 'block';

        fetch('http://localhost:3001/teacher_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userID: userID
            })
        })
        .then(response => {
            if (!response.ok) {
                console.error("Error consiguiendo datos:", error);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                setUpProfesorScreen(data.data[0])
            } else {
                console.log("Datos no encontrados");
            }
        })
        .catch(error => {
            console.error("Error consiguiendo datos:", error);
        });
    }
});

function setUpAlumnoScreen(data) {
    const greeting_text = document.getElementById('greeting_text');
    const xp_bar = document.getElementById('xp_colored_bar');
    const xp_text = document.getElementById('xp_amount');
    const xp_needed = document.getElementById('xp_to_level');
    const level = document.getElementById('level');

    level.textContent = "Nivel " + data.nivel;
    greeting_text.textContent = data.nombre + " " + data.apellido;
    xp_bar.value = data.experiencia;
    xp_text.textContent = data.experiencia + " xp";
    xp_needed.textContent = "XP para siguiente nivel: " + (1000 - data.experiencia) + " xp"

    user_type_id = data.alumno_id;

    fetch('http://localhost:3001/student_course', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            studentID: data.alumno_id
        })
    })
    .then(response => {
        if (!response.ok) {
            console.error("Error consiguiendo datos:", error);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            setUpCoursesAlumno(data.data);
        } else {
            console.log("Datos no encontrados");
        }
    })
    .catch(error => {
        console.error("Error consiguiendo datos:", error);
    });
}

function setUpCoursesAlumno(courses) {
    const course_container = document.getElementById('courses_alumno');
    
    const base_course = `
        <div class="curso_alumno">
            
            <div class="course_nameplate">
                <p class="course_name">Course name</p>
                <p class="course_id">Course id</p>
            </div>
        </div>`;

    /*<img src="../images/three_dots.png" class="course_options_students">  --> Agregar cuando tenga funcionalidad*/
    
    courses.forEach(item => {
        fetch('http://localhost:3001/course_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                courseID: item.curso_id
            })
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const new_course = base_course
                    .replace('Course name', `${data.data[0].nombre}`)
                    .replace('Course id', `${data.data[0].curso_clave}`);

                course_container.innerHTML += new_course;
            } else {
                console.log("Datos no encontrados");
            }
        })
        .catch(error => {
            console.log("Error");
        });
    });
}

function inscribirCurso() {
    const clave_curso = prompt("Clave del curso:");

    if (clave_curso != null) {
        fetch('http://localhost:3001/register_course', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentID: user_type_id,
                courseClave: clave_curso
            })
        })
        .then(response => {
            wait(200).then(() => {console.log("")});
            return response.json();
        })
        .then(data => {
            wait(200).then(() => {console.log("")});
        })
        location.reload();
    }
} 

function setUpProfesorScreen(data) {
    const greeting_text = document.getElementById('greeting_text');

    greeting_text.textContent = data.nombre + " " + data.apellido;

    user_type_id = data.profesor_id;

    fetch('http://localhost:3001/teacher_course', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            teacherID: data.profesor_id
        })
    })
    .then(response => {
        if (!response.ok) {
            console.error("Error consiguiendo datos:", error);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            setUpCoursesTeacher(data.data);
        } else {
            console.log("Datos no encontrados");
        }
    })
    .catch(error => {
        console.error("Error consiguiendo datos:", error);
    });
}

function setUpCoursesTeacher(courses) {
    const course_container = document.getElementById('professor_courses');
    
    var base_course = `
        <div class="curso_profesor">
            <div class="course_nameplate">
                <p class="course_name">Course name</p>
                <p class="course_id">Course id</p>
            </div>
        </div>`;

    /*<img src="../images/three_dots.png" class="course_options_students">  --> Agregar cuando tenga funcionalidad*/
    
    courses.forEach(item => {
        fetch('http://localhost:3001/course_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                courseID: item.curso_id
            })
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const new_course = base_course
                    .replace('Course name', `${data.data[0].nombre}`)
                    .replace('Course id', `${data.data[0].curso_clave}`);

                course_container.innerHTML += new_course;
            }
        })
    });
}

function toggleMenu(icon) {
    let menu = icon.nextElementSibling; // Encuentra el menú al lado de la imagen
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

function editCard() {
    alert("Editar tarjeta");
}

function deleteCard(button) {
    let card = button.closest(".card"); // Encuentra la tarjeta más cercana al botón
    if (card) {
        card.remove(); // Elimina la tarjeta del DOM
    }
}

function createCourseForm() {
    // Verifica si ya existe un formulario activo
    const existingForm = document.getElementById("formContainer");
    if (existingForm.style.display === "block") {
        alert("Ya hay un formulario activo.");
        return;
    }

    // Mostrar el formulario
    existingForm.style.display = "block";

    existingForm.innerHTML = `
        <label for="courseName">Nombre del curso:</label>
        <input type="text" id="courseName" placeholder="Escribe el nombre del curso">
        <input type="text" id="courseCodigo" placeholder="Escribe el codigo del curso">
        <input type="text" id="courseDesc" placeholder="Escribe la descripcion del curso">
        <button onclick="addCourse()">Confirmar</button>
    `;
}

function addCourse() {
    const courseName = document.getElementById("courseName").value;
    const courseCodigo = document.getElementById("courseCodigo").value;
    const courseDesc = document.getElementById("courseDesc").value;
    if (courseName && courseCodigo && courseDesc) {
        fetch('http://localhost:3001/create_course', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                courseName: courseName,
                courseDesc: courseDesc,
                courseClave: courseCodigo
            })
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.success) {
                createCourseCard(courseCodigo)
            }
        })
    } else {
        alert("Por favor, ingresa un nombre para el curso.");
    }
}

function createCourseCard(courseClave) {
    console.log(user_type_id, courseClave)
    fetch('http://localhost:3001/link_course', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            teacherID: user_type_id,
            courseClave: courseClave
        })
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        if (data.success) {
            wait(400).then(() => {console.log("")});
            location.reload();
        }
    })
    const existingForm = document.getElementById("formContainer");
    existingForm.style.display = 'none';

    existingForm.innerHTML = ``;
}

function openSideMenu() {
    const side_menu = document.getElementById('side_menu');
    const bg_overlay = document.getElementById('background_overlay');
    side_menu.classList.add('active');
    bg_overlay.classList.add('active')
}

function closeSideMenu() {
    const side_menu = document.getElementById('side_menu');
    const bg_overlay = document.getElementById('background_overlay');
    side_menu.classList.remove('active');
    bg_overlay.classList.remove('active');
}

function homeScreen() {
    window.location.href = `../templates/home.html`;
}

function logOut() {
    sessionStorage.removeItem('userInfo');
    alert("Cerrando sesión...");
    window.location.href = `../templates/index.html`;
}