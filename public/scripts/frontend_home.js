// let api_url = 'http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io';
let api_url = 'http://localhost:3000'


window.addEventListener('load', async () => {
    //construirBreadcrumb([
      //  { nombre: 'Inicio', url: '/home.html' }
    //]);

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
            if (response.status === 404) {
                user_role_text.textContent = 'Usuario no encontrado';
            } else if (response.status === 401) {
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

    actualizarBreadcrumb({}); // Actualiza el breadcrumb al cargar la página

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
            // Caso: Errores
            return;
        }

        const data = await response.json();
        
        const alumno_cursos = document.getElementById('alumno_cursos');

        for (let curso of data.course_data) {
            let carta_curso =`<div class="card">
                    <a href="course?code=${curso[0].cod}" style="text-decoration: none; color: inherit;">
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
        
        const profesor_cursos = document.getElementById('profesor_cursos');

        for (let curso of data.course_data) {
            let carta_curso = `<div class="card">
                    <a href="course?code=${curso[0].cod}" style="text-decoration: none; color: inherit;">
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

    // acemos el POST a la base de datos
    fetch(`${api_url}/agregar_curso`, {
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

function actualizarBreadcrumb({ curso = null, extra = null }) {
    const inicio = document.getElementById('breadcrumb-inicio');
    const cursoElem = document.getElementById('breadcrumb-curso');
    const extraElem = document.getElementById('breadcrumb-extra');
    const sep1 = document.getElementById('breadcrumb-sep-1');
    const sep2 = document.getElementById('breadcrumb-sep-2');
  
    if (!inicio || !cursoElem || !extraElem) return;
  
    // Siempre visible el inicio
    inicio.classList.remove('d-none');
  
    if (curso) {
      cursoElem.textContent = curso;
      cursoElem.classList.remove('d-none');
      sep1.classList.remove('d-none');
    } else {
      cursoElem.classList.add('d-none');
      sep1.classList.add('d-none');
    }
  
    if (extra) {
      let recortado = extra.length > 30 ? extra.slice(0, 30) + '...' : extra;
      extraElem.textContent = recortado;
      extraElem.classList.remove('d-none');
      sep2.classList.remove('d-none');
    } else {
      extraElem.classList.add('d-none');
      sep2.classList.add('d-none');
    }
  }
  
