let api_url = 'http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io';

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
            // Caso: El alumno no está inscrito a ningún curso.
            if (response.status === 404) {
                document.getElementById('sidebar_courses_all').textContent = 'No está inscrito en ningún curso.';
            }
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


