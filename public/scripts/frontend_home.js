// let api_url = 'http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io';
let api_url = 'http://localhost:3000'

/*
Función que cargará cuando todo el contenido html y css cargé en home.html.
*/
window.addEventListener('load', async () => {
    // Cargamos la página, incluyendo las barras lateral y de navegación, junto con el contenido de home.
    fetch('/utilities.html')
    .then(response => response.text())
    .then(async (html) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        while (temp.firstChild) {
            document.body.insertBefore(temp.firstChild, document.body.firstChild);
        }

        // Al terminar de cargar contenido estático, cargamos cualquier datos conseguidos a través de la conexión API.
        await load_home();

        await load_sidebar_data();

        // Terminando la carga de datos a través de la conexión, manejamos las últimas modificaciones de diseño a la barra lateral (incluyendo animaciones).
        const mediaQuery = window.matchMedia('(max-width: 767px)');

        if (!mediaQuery.matches) {
             toggleSidebar();
        }

        animationSetup();

    })
    .catch(err => console.error('Error al cargar utilidades:', err));
})

/*
Función que cargará home, conectandoló con la base de datos.
*/
async function load_home() {
    // Variable donde guardaremos los datos conseguidos de la llamada.
    let data;

    // Llamada al API para conseguir respuesta acerca de los datos de usuario para cargar la página home.
    try {

        // Llamada
        const response = await fetch(`${api_url}/user_home`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        // Checamos si hubo errores en la llamada
        if (!response.ok) {

            // Caso: No se ha iniciado sesión.
            if (response.status === 401) {
                sessionStorage.setItem('login_error', 'Se requiere iniciar sesión para utilizar la aplicación.');
                window.location.href = '/';
            }

            // Caso: Cualquier otro error.
            return;
        }

        data = await response.json();
    
    // Mostramos cualquier error que haya ocurrido.
    } catch (error) {
        console.error('Error:', error);
    }

    // A partir de los datos, conseguimos el rol del usuario. Con esto checamos si es alumno o profesor.
    if (data.user_role == 'alumno') {
        // Si es alumno, se despliega la parte de alumno.
        document.getElementById('alumno_body').style.display = 'flex';

        await load_home_alumno(data)
    } else {
        // Si es profesor, se despliega la parte de profesor.
        document.getElementById('profesor_body').style.display = 'flex';

        await load_home_profesor(data)
    }
};

/*
Función que cargará los datos del alumno en home.
*/
async function load_home_alumno(loading_data) {
    // Modificando carta de usuario para colocar nombre de usuario
    const card_name = document.getElementById('card_name');
    
    if (loading_data.nombre && loading_data.apellido) {
        card_name.innerHTML = loading_data.nombre + ' ' + loading_data.apellido;
    } else if (loading_data.nombre) {
        card_name.innerHTML = loading_data.nombre;
    } else {
        card_name.innerHTML = 'Alumno'
    }

    // Llamada al API para conseguir cursos del usuario.
    try {
        // Llamada
        const response = await fetch(`${api_url}/user_courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                user_role: 'alumnos',
                user_id: loading_data.user_id
            })
        });

        if (!response.ok) {
            // Caso: Errores
            return;
        }

        // Conseguimos los datos de los cursos.
        const data = await response.json();
        
        // Insertamos los cursos en la página principal.
        const alumno_cursos = document.getElementById('alumno_cursos');

        for (let course of data.course_data) {
            let course_card =`<div class="card">
                    <a href="course?code=${course[0].cod}" style="text-decoration: none; color: inherit;">
                        <img class="card-img-top" src="../images/educacion.png" alt="Card image cap"
                            style="height: 8rem; object-fit: cover; border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem;">
                        <div class="card-body" style="height: 7rem; padding: 0.5rem;">
                            <h9 class="card-title" style="font-size: 1rem; font-weight: bold; font-family: Arial, sans-serif; margin-bottom: 0.2rem;">${course[0].nombre}</h9>
                            <h15 class="card-code" style="font-size: 0.625rem; margin-bottom: 0.2rem; display: block;">${course[0].cod}</h15>
                            <small class="card-text" style="font-size: 0.75rem; margin: 0.3rem 0 0.8rem;">${course[0].descripcion}</small>
                        </div>
                    </a>
                </div>`

            alumno_cursos.innerHTML += course_card;
        };

    } catch (error) {
        console.error('Error:', error);
    }
}

/*
Función que cargará los datos del alumno en home.
*/
async function load_home_profesor(loading_data) {
    // Llamada al API para conseguir cursos del usuario.
    try {
        // Llamada
        const response = await fetch(`${api_url}/user_courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                user_role: 'profesores',
                user_id: loading_data.user_id
            })
        });


        if (!response.ok) {
            // Caso: El profesor no da ningún curso.
            if (response.status === 404) {
                user_role_text.textContent = 'No da ningun curso';
            }
            return;
        }

        // Conseguimos los datos de los cursos.
        const data = await response.json();
        
        const profesor_cursos = document.getElementById('profesor_cursos');

        for (let course of data.course_data) {
            let course_card = `<div class="card">
                    <a href="course?code=${course[0].cod}" style="text-decoration: none; color: inherit;">
                        <img class="card-img-top" src="../images/educacion.png" alt="Card image cap"
                            style="height: 8rem; object-fit: cover; border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem;">
                        <div class="card-body" style="height: 7rem; padding: 0.5rem;">
                            <h9 class="card-title" style="font-size: 1rem; font-weight: bold; font-family: Arial, sans-serif; margin-bottom: 0.2rem;">${course[0].nombre}</h9>
                            <h15 class="card-code" style="font-size: 0.625rem; margin-bottom: 0.2rem; display: block;">${course[0].cod}</h15>
                            <small class="card-text" style="font-size: 0.75rem; margin: 0.3rem 0 0.8rem;">${course[0].descripcion}</small>
                        </div>
                    </a>
                </div>`
            profesor_cursos.innerHTML += course_card;
        };

    } catch (error) {
        console.error('Error:', error);
    }
}

document.getElementById("saveCourseButton").addEventListener("click", function() {
    const courseNameElement = document.getElementById("courseName");
    const courseKeyElement = document.getElementById("courseKey");
    const descriptionElement = document.getElementById("description");
    const studentElement = document.getElementById("studentSelect");

    // Asegurar que los valores no sean null antes de usarlos
    const courseName = courseNameElement ? courseNameElement.value : "";
    const courseKey = courseKeyElement ? courseKeyElement.value : "";
    const description = descriptionElement ? descriptionElement.value : "";
    const studentSelect = studentElement ? studentElement.value : "";

    // Verificar que se estén enviando datos correctos antes del POST
    console.log("Datos enviados al backend:", { cod: courseKey, nombre: courseName, descripcion: description });

    // Evitar que se envíe un curso vacío
    if (!courseName || !courseKey) {
        alert("El nombre y la clave del curso son obligatorios.");
        return;
    }

    // Crear tarjeta del curso en la interfaz
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
        console.log("Curso agregado:", data);
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

// Lista de alumnos seleccionados
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
            ? alumnos.filter(alumno => (alumno.nombre + ' ' + alumno.apellido).toLowerCase().includes(searchInput.value.toLowerCase()))
            : alumnos;

        filteredAlumnos.forEach(alumno => {
            const apellido = alumno.apellido ? alumno.apellido : "(Sin apellido)";
            const option = document.createElement('button');
            option.classList.add('dropdown-item');
            option.textContent = `${alumno.nombre} ${apellido}`;
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

// Seleccionar un alumno y agregarlo a la lista, asegurando que apellido no sea null
function seleccionarAlumno(event, alumno) {
    event.preventDefault();

    const alumnoCorregido = {
        nombre: alumno.nombre,
        apellido: alumno.apellido ? alumno.apellido : ""
    };

    if (!selectedStudents.some(student => student.nombre === alumno.nombre && student.apellido === alumno.apellido)) {
        selectedStudents.push(alumnoCorregido);
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
        const apellido = alumno.apellido ? alumno.apellido : "";
        const studentItem = document.createElement('div');
        studentItem.classList.add('student-item');
        studentItem.innerHTML = `
            <span>${alumno.nombre} ${apellido}</span>
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
