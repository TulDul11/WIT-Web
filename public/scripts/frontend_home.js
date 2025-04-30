let api_url = 'http://iswg4wsw8g8wkookg4gkswog.172.200.210.83.sslip.io';

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
    const header_alumno = document.getElementById('header_alumno');
    
    if (loading_data.nombre && loading_data.apellido) {
        header_alumno.innerHTML = 'Bienvenid@, ' + loading_data.nombre + ' ' + loading_data.apellido + '!';
    } else if (loading_data.nombre) {
        header_alumno.innerHTML = 'Bienvenid@, ' + loading_data.nombre + '!';
    } else {
        header_alumno.innerHTML = 'Bienvenid@!'
    }

    // Escondemos documentación técnica de la aplicación (para que no vean los alumnos)
    document.getElementById('sidebar_docs').style.display = 'none';

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
                                <a href="course?code=${course[0].cod}">
                                    <img class="card_image" src="../images/educacion.png">
                                    <div class="card_body">
                                        <h15 class="card_code">${course[0].cod}</h15>
                                        <h9 class="card_title">${course[0].nombre}</h9>
                                    </div>
                                </a>
                            </div>`

            alumno_cursos.innerHTML += course_card;
        };

        const filter_input = document.getElementById('filter_input_alumno');
        const coursesContainer = document.getElementById('alumno_cursos');

        // Escuchamos el evento "input" para capturar lo que el usuario escribe
        filter_input.addEventListener('input', function () {
            const filter_value = this.value.toLowerCase(); // Convertimos a minúsculas para que no sea case-sensitive
            const course_cards = coursesContainer.querySelectorAll('.card'); // Seleccionamos todas las tarjetas

            course_cards.forEach(card => {
                const course_title = card.querySelector('.card_title').textContent.toLowerCase(); // Título del curso
                const course_code = card.querySelector('.card_code').textContent.toLowerCase(); // Código del curso

                // Mostramos u ocultamos la tarjeta dependiendo de si coincide con el filtro
                if (course_title.includes(filter_value) || course_code.includes(filter_value)) {
                    card.style.display = 'block'; // Mostramos la tarjeta
                } else {
                    card.style.display = 'none'; // Ocultamos la tarjeta
                }
            });
        });

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
 
         for (let curso of data.course_data) {
             const card = document.createElement('div');
             card.className = 'card';
             card.id = `card-${curso[0].cod}`;
 
             card.innerHTML = `<a href="course?code=${curso[0].cod}">
                                    <img class="card_image" src="../images/educacion.png">
                                    <div class="card_body">
                                        <h15 class="card_code">${curso[0].cod}</h15>
                                        <h9 class="card_title">${curso[0].nombre}</h9>
                                    </div>
                                </a>
                                <img src="../images/three_dots.png" alt="Opciones" class="card_menu_icon">
                                <div class="card_options_menu">
                                    <button class="menu-option" id="edit_course_button">Editar</button>
                                    <button class="menu-option" id="erase_course_button">Borrar</button>
                                </div>`;
            
             profesor_cursos.appendChild(card);
 
             // Agregar eventos
             const threeDotsIcon = card.querySelector('.card_menu_icon');
             const menu = card.querySelector('.card_options_menu');
             const [editarBtn, eliminarBtn] = menu.querySelectorAll('button');
 
             threeDotsIcon.addEventListener('click', function (event) {
                 event.preventDefault();
                 event.stopPropagation();
                 menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'flex' : 'none';
             });
 
             document.addEventListener('click', function (event) {
                 if (!card.contains(event.target)) {
                     menu.style.display = 'none';
                 }
             });
 
             editarBtn.addEventListener('click', function (event) {
                 event.preventDefault();
                 event.stopPropagation();
                 editarCurso(curso[0].cod);
             });
 
             eliminarBtn.addEventListener('click', async function (event) {
                 event.preventDefault();
                 event.stopPropagation();
                 await eliminarCurso(curso[0].cod);
                 location.reload();
             });
         }

         // Seleccionamos el input del filtro y el contenedor de los cursos
        const filter_input = document.getElementById('filter_input_profesor');
        const courses_container = document.getElementById('profesor_cursos');

        // Escuchamos el evento "input" para capturar lo que el usuario escribe
        filter_input.addEventListener('input', function () {
            const filter_value = this.value.toLowerCase(); // Convertimos a minúsculas para que no sea case-sensitive
            const course_cards = courses_container.querySelectorAll('.card'); // Seleccionamos todas las tarjetas

            course_cards.forEach(card => {
                const course_title = card.querySelector('.card_title').textContent.toLowerCase(); // Título del curso
                const course_code = card.querySelector('.card_code').textContent.toLowerCase(); // Código del curso

                // Mostramos u ocultamos la tarjeta dependiendo de si coincide con el filtro
                if (course_title.includes(filter_value) || course_code.includes(filter_value)) {
                    card.style.display = 'block'; // Mostramos la tarjeta
                } else {
                    card.style.display = 'none'; // Ocultamos la tarjeta
                }
            });
        });

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

    card.innerHTML = `<a href="course?code=${courseKey}">
                                    <img class="card_image" src="../images/educacion.png">
                                    <div class="card_body">
                                        <h15 class="card_code">${courseKey}</h15>
                                        <h9 class="card_title">${courseName}</h9>
                                    </div>
                                </a>
                                <img src="../images/three_dots.png" alt="Opciones" class="card_menu_icon">
                                <div class="card_options_menu">
                                    <button class="menu-option" id="edit_course_button">Editar</button>
                                    <button class="menu-option" id="erase_course_button">Borrar</button>
                                </div>`;;

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
  