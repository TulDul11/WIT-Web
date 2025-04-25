//let api_url = 'http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io';
let api_url = 'http://localhost:3000';

window.addEventListener('load', async () => {
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
                document.getElementById('nav_role').textContent = 'Usuario no encontrado';
            } else if (response.status === 401) {
                window.location.href = '/';
            }
            return;
        }

        data = await response.json();
    } catch (error) {
        console.error('Error:', error);
    }

    user_role = data.user_role === 'alumno' ? 'Alumno' : 'Profesor';
    const user_role_text = document.getElementById('nav_role');
    user_role_text.textContent = user_role;
    const card_name = document.getElementById('card_name');
    card_name.innerHTML = data.apellido ? `${data.nombre} ${data.apellido}` : data.nombre;

    if (user_role === 'Alumno') {
        document.getElementById('alumno_body').style.display = 'flex';
        set_up_alumno('alumnos', data.user_id);
    } else {
        document.getElementById('profesor_body').style.display = 'flex';
        set_up_profesor('profesores', data.user_id);
    }
});

async function set_up_alumno(user_role, user_id) {
    try {
        const response = await fetch(`${api_url}/user_courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ user_role, user_id })
        });

        if (!response.ok) {
            if (response.status === 404) {
                document.getElementById('nav_role').textContent = 'No está inscrito en ningún curso';
            }
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        const alumno_cursos = document.getElementById('alumno_cursos');

        for (let curso of data.course_data) {
            let carta_curso = `
                <div class="card">
                    <a href='course' style="text-decoration: none; color: inherit;">
                        <img class="card-img-top" src="../images/educacion.png" alt="Card image cap">
                        <div class="card-body">
                            <h9 class="card-title">${curso[0].nombre}</h9>
                            <h15 class="card-code">${curso[0].cod}</h15>
                            <small class="card-text">${curso[0].descripcion}</small>
                        </div>
                    </a>
                </div>`;
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
            body: JSON.stringify({ user_role, user_id })
        });

        if (!response.ok) {
            if (response.status === 404) {
                document.getElementById('nav_role').textContent = 'No da ningún curso';
            }
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        const profesor_cursos = document.getElementById('profesor_cursos');

        for (let curso of data.course_data) {
            let carta_curso = `
                <div class="profesor-card">
                    <a href='course' style="text-decoration: none; color: inherit;">
                        <img class="card-img-top" src="../images/educacion.png" alt="Card image cap">
                        <div class="card-body">
                            <h3 class="profesor-card-title">${curso[0].nombre}</h3>
                            <p class="profesor-card-code">${curso[0].cod}</p>
                            <small class="profesor-card-text">${curso[0].descripcion}</small>
                        </div>
                    </a>
                </div>`;
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
    const courseNameElement = document.getElementById("courseName");
    const courseKeyElement = document.getElementById("courseKey");
    const descriptionElement = document.getElementById("description");

    const courseName = courseNameElement ? courseNameElement.value : "";
    const courseKey = courseKeyElement ? courseKeyElement.value : "";
    const description = descriptionElement ? descriptionElement.value : "";

    // Verificar que se estén enviando datos correctos antes del POST
    console.log("Datos enviados al backend:", { cod: courseKey, nombre: courseName, descripcion: description });

    // Evitar que se envíe un curso vacío
    if (!courseName || !courseKey) {
        alert("El nombre y la clave del curso son obligatorios.");
        return;
    }

    // Enviar datos al backend
    fetch('http://localhost:3000/agregar_curso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            cod: courseKey,
            nombre: courseName,
            descripcion: description
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "El curso ya existe con esa clave.") {
            // Si el curso ya existe, mostrar un mensaje de advertencia
            alert("El curso ya existe con esa clave.");
            return; // No agregar la tarjeta
        }

        console.log("Curso agregado:", data);

        // Si el curso se agregó exitosamente, crear la tarjeta
        const card = document.createElement("div");
        card.classList.add("profesor-card");
        card.innerHTML = `
            <a href="#" style="text-decoration: none; color: inherit;">
                <img class="card-img-top" src="../images/educacion.png" alt="Imagen del curso">
                <div class="profesor-card-body">
                    <h3 class="profesor-card-title">${courseName}</h3>
                    <p class="profesor-card-code">${courseKey}</p>
                    <small class="profesor-card-text">${description}</small> 
                </div>
            </a>
        `;
        document.getElementById("profesor_cursos").appendChild(card);
    })
    .catch(error => {
        console.error('Error al agregar curso:', error);
    });

    // Limpiar campos después de guardar
    if (courseNameElement) courseNameElement.value = "";
    if (courseKeyElement) courseKeyElement.value = "";
    if (descriptionElement) descriptionElement.value = "";

    // Limpiar lista de alumnos seleccionados
    selectedStudents = [];
    mostrarAlumnosSeleccionados();

    // Cerrar el modal asegurando que su instancia existe
    const modalElement = document.getElementById('exampleModal');
    if (modalElement) {
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();
    }
});


// Seleccionamos el input del filtro y el contenedor de los cursos
const filterInput = document.getElementById('filterInput');
const coursesContainer = document.getElementById('profesor_cursos');

// Escuchamos el evento "input" para capturar lo que el usuario escribe
filterInput.addEventListener('input', function () {
    const filterValue = this.value.toLowerCase(); // Convertimos a minúsculas para que no sea case-sensitive
    const courseCards = coursesContainer.querySelectorAll('.profesor-card'); // Seleccionamos todas las tarjetas

    courseCards.forEach(card => {
        const courseTitle = card.querySelector('.profesor-card-title').textContent.toLowerCase(); // Título del curso
        const courseDescription = card.querySelector('.profesor-card-text').textContent.toLowerCase(); // Descripción del curso

        // Mostramos u ocultamos la tarjeta dependiendo de si coincide con el filtro
        if (courseTitle.includes(filterValue) || courseDescription.includes(filterValue)) {
            card.style.display = 'block'; // Mostramos la tarjeta
        } else {
            card.style.display = 'none'; // Ocultamos la tarjeta
        }
    });
});

let selectedStudents = [];

// Función para cargar alumnos en el dropdown
async function cargarAlumnosEnDropdown() {
    try {
        const response = await fetch('/obtener_alumnos');
        const alumnos = await response.json();

        const searchInput = document.getElementById('searchStudent');
        const dropdown = document.getElementById('studentDropdown');

        dropdown.innerHTML = '';

        const filteredAlumnos = searchInput.value
            ? alumnos.filter(alumno => alumno.nombre.toLowerCase().includes(searchInput.value.toLowerCase()))
            : alumnos;

            filteredAlumnos.forEach(alumno => {
                const option = document.createElement('button');
                option.classList.add('dropdown-item');
                option.textContent = `${alumno.id_usuario} (${alumno.nombre})`;
                option.addEventListener('click', (event) => seleccionarAlumno(event, alumno));
                dropdown.appendChild(option);
            });
            

        if (filteredAlumnos.length === 0) {
            const noResultsOption = document.createElement('button');
            noResultsOption.classList.add('dropdown-item');
            noResultsOption.disabled = true;
            noResultsOption.textContent = 'No se encontraron alumnos';
            dropdown.appendChild(noResultsOption);
        }

        dropdown.style.display = 'block';
    } catch (err) {
        console.error('Error al cargar alumnos:', err);
    }
}

// Seleccionar un alumno
function seleccionarAlumno(event, alumno) {
    event.preventDefault();

    if (!selectedStudents.some(student => student.id_usuario === alumno.id_usuario)) {
        selectedStudents.push(alumno);
        mostrarAlumnosSeleccionados();
    }

    document.getElementById('searchStudent').value = '';
    document.getElementById('studentDropdown').style.display = 'none';
}

// Mostrar alumnos seleccionados en el box
function mostrarAlumnosSeleccionados() {
    const studentListBox = document.getElementById('studentListBox');
    studentListBox.innerHTML = '';

    selectedStudents.forEach((alumno, index) => {
        const studentItem = document.createElement('div');
        studentItem.classList.add('student-item');
        studentItem.innerHTML = `
            <span>${alumno.nombre}</span>
            <button class="btn btn-danger btn-sm ms-2" onclick="eliminarAlumno(${index})">X</button>
        `;
        studentListBox.appendChild(studentItem);
    });
}

// Eliminar alumno de la lista
function eliminarAlumno(index) {
    selectedStudents.splice(index, 1);
    mostrarAlumnosSeleccionados();
}


// Evento para mostrar dropdown al hacer clic en el campo de búsqueda
document.getElementById('searchStudent').addEventListener('focus', async () => {
    const dropdown = document.getElementById('studentDropdown');
    await cargarAlumnosEnDropdown();
    dropdown.style.display = 'block';
});

// Evento para actualizar el dropdown cuando el usuario escribe
document.getElementById('searchStudent').addEventListener('input', cargarAlumnosEnDropdown);

// Evitar que el usuario presione "Enter" y se refresque el formulario
document.getElementById('searchStudent').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
});

// Evento para ocultar el dropdown si el usuario hace clic fuera
document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('studentDropdown');
    const searchInput = document.getElementById('searchStudent');

    if (!event.target.closest('#searchStudent') && !event.target.closest('#studentDropdown')) {
        dropdown.style.display = 'none';
    }
});

document.getElementById("csvUpload").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const csvContent = e.target.result;
            const rows = csvContent.split("\n");
            const studentNames = rows.join("\n").trim(); // Convierte las líneas del CSV en texto
            document.getElementById("studentName").value = studentNames; // Pone el contenido en el textarea
        };
        reader.readAsText(file); // Lee el contenido del archivo CSV
    }
});

