//let api_url = 'http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io';
let api_url = 'http://localhost:3000';

/*
Función que cargará cuando todo el contenido html y css cargé en home.html.
*/
window.addEventListener('DOMContentLoaded', async () => {
    // Llamada a función que agregará el contenido de las barras laterales y de navegación.
    // La llamada incluye la función que se encarga de la configuración de 
    load_utilities(setup_utilities);

    let user_role;
    let data;
    try {
        const response = await fetch(`${api_url}/user_home`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/';
            }
            return;
        }

        data = await response.json();
    } catch (error) {
        console.error('Error:', error);
    }

    user_role = data.user_role == 'alumno' ? 'Alumno' : 'Profesor';

    const user_role_text = document.getElementById('nav_role');
    user_role_text.textContent = user_role;
    const card_name = document.getElementById('card_name');

    if (data.apellido) {
        card_name.innerHTML = data.nombre + ' ' + data.apellido;
    } else {
        card_name.innerHTML = data.nombre
    }
    
    if (user_role == 'Alumno') {
        const alumno_body = document.getElementById('alumno_body');
        alumno_body.style.display = 'flex';
        set_up_alumno('alumnos', data.user_id)
    } else {
        const profesor_body = document.getElementById('profesor_body');
        profesor_body.style.display = 'flex';
        set_up_profesor('profesores', data.user_id)
    }
})

/*
Cargamos las barras lateral y de navegación.
*/
function load_utilities(callback) {
    fetch('/utilities.html')
    .then(response => response.text())
    .then(html => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        while (temp.firstChild) {
            document.body.insertBefore(temp.firstChild, document.body.firstChild);
        }
        
        // Llamamos la función que se ha pasado de parámetro (si es que está presente).
        if (callback && typeof callback === "function") {
            callback();
        }
    })
    .catch(err => console.error('Error al cargar utilidades:', err));
}

async function set_up_alumno(user_role, user_id) {
    try {
        const response = await fetch(`${api_url}/user_courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                user_role: user_role,
                user_id: user_id
            })
        });

        if (!response.ok) {
            if (response.status === 404) {
                user_role_text.textContent = 'No esta inscrito en ningun curso';
            }
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        
        const alumno_cursos = document.getElementById('alumno_cursos');

        for (let curso of data.course_data) {
            let carta_curso = `<div class="card"  style="width: 18rem; background-color: #ffffff; border-radius: 0.5rem; box-shadow: 0 0 12px rgba(1, 28, 44, 0.3), 0 0 22px rgba(0, 163, 255, 0.2);">
                    <a href='course' style="text-decoration: none; color: inherit;">
                        <img class="card-img-top" src="../images/educacion.png" alt="Card image cap"
                            style="height: 8rem; object-fit: cover; border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem;">
                        <div class="card-body" style="height: 7rem; padding: 0.5rem;">
                            <h9 class="card-title" style="font-size: 1rem; font-weight: bold; font-family: Arial, sans-serif; margin-bottom: 0.2rem;">${curso[0].nombre}</h9>
                            <h15 class="card-code" style="font-size: 0.625rem; margin-bottom: 0.2rem; display: block;">${curso[0].cod}</h15>
                            <small class="card-text" style="font-size: 0.75rem; margin: 0.3rem 0 0.8rem;">${curso[0].descripcion}</small>
                        </div>
                    </a>
                </div>`
            alumno_cursos.innerHTML += carta_curso;
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

async function set_up_profesor(user_role, user_id) {
    try {
        const response = await fetch(`${api_url}/user_courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                user_role: user_role,
                user_id: user_id
            })
        });

        if (!response.ok) {
            if (response.status === 404) {
                user_role_text.textContent = 'No da ningun curso';
            }
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        
        const profesor_cursos = document.getElementById('coursesContainer');

        for (let curso of data.course_data) {
            let carta_curso = `<div class="card" href='course.html' style="width: 18rem; background-color: #ffffff; border-radius: 0.5rem; box-shadow: 0 0 12px rgba(1, 28, 44, 0.3), 0 0 22px rgba(0, 163, 255, 0.2);">
                    <a href='course' style="text-decoration: none; color: inherit;">
                        <img class="card-img-top" src="../images/educacion.png" alt="Card image cap"
                            style="height: 8rem; object-fit: cover; border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem;">
                        <div class="card-body" style="height: 7rem; padding: 0.5rem;">
                            <h9 class="card-title" style="font-size: 1rem; font-weight: bold; font-family: Arial, sans-serif; margin-bottom: 0.2rem;">${curso[0].nombre}</h9>
                            <h15 class="card-code" style="font-size: 0.625rem; margin-bottom: 0.2rem; display: block;">${curso[0].cod}</h15>
                            <small class="card-text" style="font-size: 0.75rem; margin: 0.3rem 0 0.8rem;">${curso[0].descripcion}</small>
                        </div>
                    </a>
                </div>`
            profesor_cursos.innerHTML += carta_curso;
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

function home_screen() {
    location.reload();
}

async function log_out() {
    try {
        const response = await fetch(`${api_url}/logout`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            if (response.status === 500) {
                console.error('Cerrar sesión fallida.');
            }
        } else {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

document.getElementById("saveCourseButton").addEventListener("click", function() {
    const courseName = document.getElementById("courseName").value;
    const courseKey = document.getElementById("courseKey").value;
    const description = document.getElementById("description").value;
    const csvUpload = document.getElementById("csvUpload").value;

    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
        <a href="#" style="text-decoration: none; color: inherit;">
            <img class="card-img-top" src="../images/educacion.png" alt="Imagen del curso">
            <div class="card-body">
                <h9 class="card-title">${courseName}</h9>
                <h15 class="card-code">${courseKey}</h15>
                <small class="card-text">${description}</small> <br>
            </div>
        </a>
    `;

    document.getElementById("coursesContainer").appendChild(card);

    // 🔽🔽 Hacemos el POST a la base de datos
    fetch('http://localhost:3000/agregar_curso', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cod: courseKey,
            nombre: courseName,
            descripcion: description
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Curso agregado:", data);
    })
    .catch(error => {
        console.error('Error al agregar curso:', error);
    });

    // Limpiar campos
    document.getElementById("courseName").value = "";
    document.getElementById("courseKey").value = "";
    document.getElementById("description").value = "";
    document.getElementById("csvUpload").value = "";

    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
    modal.hide();
});


document.getElementById("csvUpload").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const csvContent = e.target.result;
            const rows = csvContent.split("\n");
            const studentNames = rows.join("\n").trim(); // Convierte las líneas del CSV en texto
            document.getElementById("studentList").value = studentNames; // Pone el contenido en el textarea
        };
        reader.readAsText(file); // Lee el contenido del archivo CSV
    }
});

// Seleccionamos el input del filtro y el contenedor de los cursos
const filterInput = document.getElementById('filterInput');
const coursesContainer = document.getElementById('coursesContainer');

// Escuchamos el evento "input" para capturar lo que el usuario escribe
filterInput.addEventListener('input', function () {
    const filterValue = this.value.toLowerCase(); // Convertimos a minúsculas para que no sea case-sensitive
    const courseCards = coursesContainer.querySelectorAll('.card'); // Seleccionamos todas las tarjetas

    courseCards.forEach(card => {
        const courseTitle = card.querySelector('.card-title').textContent.toLowerCase(); // Título del curso
        const courseDescription = card.querySelector('.card-text').textContent.toLowerCase(); // Descripción del curso

        // Mostramos u ocultamos la tarjeta dependiendo de si coincide con el filtro
        if (courseTitle.includes(filterValue) || courseDescription.includes(filterValue)) {
            card.style.display = 'block'; // Mostramos la tarjeta
        } else {
            card.style.display = 'none'; // Ocultamos la tarjeta
        }
    });
});


