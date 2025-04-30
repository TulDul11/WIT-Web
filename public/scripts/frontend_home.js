// let api_url = 'http://iswg4wsw8g8wkookg4gkswog.172.200.210.83.sslip.io';
let api_url = 'http://localhost:3000';


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

async function load_home_profesor(loading_data) {

    
    try {
        const response = await fetch(`${api_url}/user_courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                user_role: 'profesores',
                user_id: loading_data.user_id
            })
        });

        if (!response.ok) {
            if (response.status === 404) {
                user_role_text.textContent = 'No da ningún curso';
            }
            return;
        }

        const data = await response.json();
        const profesor_cursos = document.getElementById('profesor_cursos');

        for (let curso of data.course_data) {
            const card = document.createElement('div');
            card.className = 'card';
            card.id = `card-${curso[0].cod}`;
            card.style.position = 'relative';

            card.innerHTML = `
                <a href='/course?code=${curso[0].cod}' style="text-decoration: none; color: inherit;">
                    <img class="card_image" src="../images/educacion.png" alt="Card image cap">
                </a>
                <img src="../images/three_dots.png" alt="Opciones" class="card_menu_icon" >
                     
                    <div class="options-menu">
                        <button class="menu-option editar-btn" data-codigo="${curso[0].cod}">Editar</button>
                    <button class="menu-option borrar-btn" data-codigo="${curso[0].cod}">Borrar</button>
                </div>
                <div class="card_body">
                    <h3 class="card_title">${curso[0].nombre}</h3>
                    <p class="card_code">${curso[0].cod}</p>
                </div>
            `;

            profesor_cursos.appendChild(card);
            

            const threeDotsIcon = card.querySelector('.card_menu_icon');
            const menu = card.querySelector('.options-menu');
            const [editarBtn, eliminarBtn] = menu.querySelectorAll('button');

            threeDotsIcon.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'block' : 'none';
            });

            document.addEventListener('click', function (event) {
                if (!card.contains(event.target)) {
                    menu.style.display = 'none';
                }
            });

            editarBtn.addEventListener('click', async function (event) {
                event.preventDefault();
                event.stopPropagation();

                document.getElementById('studentDropdown').innerHTML = '';
                document.getElementById('studentListBox').innerHTML = '';

                document.getElementById('editStudentForm').dataset.courseId = curso[0].cod;

                await editarCurso(curso[0].cod);

                const modal = new bootstrap.Modal(document.getElementById('editCourseModal'));
                modal.show();
            });

            eliminarBtn.addEventListener('click', async function (event) {
                event.preventDefault();
                event.stopPropagation();
                await eliminarCurso(curso[0].cod);
                location.reload(true);
            });
        }


    } catch (error) {
        console.error('Error:', error);
    }
}

async function editarCurso(codCurso) {
    try {
        const response = await fetch(`${api_url}/alumnos_del_curso/${codCurso}`);
        const alumnos = await response.json();

        assignedSelectedStudents = [...alumnos]; // guardar la lista original
        mostrarAlumnosSeleccionadosAssigned();   // reutilizar función que ya muestra y permite borrar

    } catch (error) {
        console.error('Error al cargar alumnos del curso:', error);
    }
}

let assignedSelectedStudents = [];

async function cargarAlumnosEnDropdownAssigned() {
    try {
        const response = await fetch(`${api_url}/obtener_alumnos`);
        const alumnos = await response.json();

        const searchInput = document.getElementById('assignedsearchStudent');
        const dropdown = document.getElementById('assignedStudentDropdown');

        dropdown.innerHTML = '';

        const filteredAlumnos = searchInput.value
            ? alumnos.filter(alumno =>
                alumno.nombre.toLowerCase().includes(searchInput.value.toLowerCase())
            )
            : alumnos;

        filteredAlumnos.forEach(alumno => {
            const option = document.createElement('button');
            option.classList.add('dropdown-item');
            option.textContent = `${alumno.id} - ${alumno.nombre}`;
            option.addEventListener('click', (event) => seleccionarAlumnoAssigned(event, alumno));
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
        console.error('Error al cargar alumnos (assigned):', err);
    }
}

function seleccionarAlumnoAssigned(event, alumno) {
    event.preventDefault();

    if (!assignedSelectedStudents.some(student => student.id === alumno.id)) {
        assignedSelectedStudents.push(alumno);
        console.log('Alumno agregado (assigned):', alumno);
        mostrarAlumnosSeleccionadosAssigned();
    }

    document.getElementById('assignedsearchStudent').value = '';
    document.getElementById('assignedStudentDropdown').style.display = 'none';
}

function mostrarAlumnosSeleccionadosAssigned() {
    const studentListBox = document.getElementById('assignedStudentListBox');
    studentListBox.innerHTML = '';

    assignedSelectedStudents.forEach((alumno, index) => {
        const studentItem = document.createElement('div');
        studentItem.classList.add('student-item');
        studentItem.innerHTML = `
            <span>${alumno.nombre}</span>
            <button class="btn btn-danger btn-sm ms-2" onclick="eliminarAlumnoAssigned(${index})">X</button>
        `;
        studentListBox.appendChild(studentItem);
    });
}

function eliminarAlumnoAssigned(index) {
    assignedSelectedStudents.splice(index, 1);
    mostrarAlumnosSeleccionadosAssigned();
}

// Eventos para el assigned
document.getElementById('assignedsearchStudent').addEventListener('focus', async () => {
    const dropdown = document.getElementById('assignedStudentDropdown');
    await cargarAlumnosEnDropdownAssigned();
    dropdown.style.display = 'block';
});

document.getElementById('assignedsearchStudent').addEventListener('input', cargarAlumnosEnDropdownAssigned);

document.getElementById('assignedsearchStudent').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
});

document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('assignedStudentDropdown');
    const searchInput = document.getElementById('assignedsearchStudent');

    if (!event.target.closest('#assignedsearchStudent') && !event.target.closest('#assignedStudentDropdown')) {
        dropdown.style.display = 'none';
    }
});

document.getElementById('saveStudentChanges').addEventListener('click', async function () {
    const courseId = document.getElementById('editStudentForm').dataset.courseId;

    try {
        const response = await fetch(`${api_url}/actualizar_alumnos_curso/${courseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                alumnos: assignedSelectedStudents.map(alumno => alumno.id)
            })
        });

        if (!response.ok) throw new Error('Error al guardar cambios');

        alert('Cambios guardados correctamente');
        location.reload();
    } catch (error) {
        console.error('Error al actualizar alumnos:', error);
        alert('No se pudieron guardar los cambios');
    }
});



document.getElementById("saveCourseButton").addEventListener("click", function() {
    const courseNameElement = document.getElementById("courseName");
    const courseKeyElement = document.getElementById("courseKey");
    const descriptionElement = document.getElementById("description");

    const courseName = courseNameElement ? courseNameElement.value : "";
    const courseKey = courseKeyElement ? courseKeyElement.value : "";
    const description = descriptionElement ? descriptionElement.value : "";

    if (!courseName || !courseKey) {
        alert("El nombre y la clave del curso son obligatorios.");
        return;
    }

    // Capturamos los alumnos seleccionados en una variable temporal
    const alumnosSeleccionados = [...selectedStudents];

    // Hacemos el POST a la base de datos
    fetch(`${api_url}/agregar_curso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            cod: courseKey,
            nombre: courseName,
            descripcion: description
        })
    })
    .then(response => response.json())
    .then(async data => {
        if (data.message === "El curso ya existe con esa clave.") {
            alert("El curso ya existe con esa clave.");
            return;
        }

        console.log("Curso agregado:", data);


    
    // Después de crear la tarjeta del curso…
    if (alumnosSeleccionados.length > 0) {
        // Espera 500ms antes de asignar los alumnos (prueba ajustar ese valor)
        setTimeout(() => {
            alumnosSeleccionados.forEach(alumno => {
                console.log(`Enviando alumno: ${alumno.id} para el curso: ${courseKey}`);
                fetch(`${api_url}/agregar_alumno_curso`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_alumno: alumno.id,
                        cod_curso: courseKey
                    })
                })
                .then(response => response.json())
                .then(dataAlumno => {
                    console.log(`Alumno ${alumno.id} asignado al curso:`, dataAlumno);
                })
                .catch(error => {
                    console.error(`Error al asignar el alumno ${alumno.id}:`, error);
                });
            });
            location.reload(true);
        }, 500);
    }

    })
    .catch(error => {
        console.error('Error al agregar curso:', error);
    })
    .finally(() => {
        // Limpiar campos después de guardar solo después de que se haya iniciado la asignación
        if (courseNameElement) courseNameElement.value = "";
        if (courseKeyElement) courseKeyElement.value = "";
        if (descriptionElement) descriptionElement.value = "";
        // Ahora puedes limpiar el array original
        selectedStudents = [];
        mostrarAlumnosSeleccionados();

        // Cerrar el modal
        const modalElement = document.getElementById('exampleModal');
        if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
        }
    });
});



const coursesContainer = document.getElementById('profesor_cursos');

let selectedStudents = [];

// Función para cargar alumnos en el dropdown
async function cargarAlumnosEnDropdown() {
    try {
        const response = await fetch(`${api_url}/obtener_alumnos`);
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
                option.textContent = `${alumno.id} - ${alumno.nombre}`;
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

function seleccionarAlumno(event, alumno) {
    event.preventDefault();

    if (!selectedStudents.some(student => student.id === alumno.id)) {
        selectedStudents.push(alumno);
        console.log('Alumno agregado:', alumno); // Verifica si se agrega correctamente
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



document.getElementById('searchStudent').addEventListener('focus', async () => {
    const dropdown = document.getElementById('studentDropdown');
    await cargarAlumnosEnDropdown();
    dropdown.style.display = 'block';
});


document.getElementById('searchStudent').addEventListener('input', cargarAlumnosEnDropdown);


document.getElementById('searchStudent').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
});


document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('studentDropdown');
    const searchInput = document.getElementById('searchStudent');

    if (!event.target.closest('#searchStudent') && !event.target.closest('#studentDropdown')) {
        dropdown.style.display = 'none';
    }
});




    // Función para actualizar los contadores de caracteres
function updateCharacterCount(inputId, countId, maxLength) {
    const input = document.getElementById(inputId);
    const count = document.getElementById(countId);
    input.addEventListener('input', function() {
        const currentLength = input.value.length;
        count.textContent = `${currentLength}/${maxLength} caracteres`;
    });
}

    // Inicializar los contadores de caracteres
updateCharacterCount('courseName', 'courseNameCount', 50);
updateCharacterCount('courseKey', 'courseKeyCount', 16);
updateCharacterCount('description', 'descriptionCount', 3000);

document.getElementById('csvUpload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        const content = e.target.result.trim();
        const rows = content.split("\n");

        const tableBody = document.getElementById("userTable").querySelector("tbody");
        tableBody.innerHTML = ""; // Limpiar tabla

        rows.forEach((row, index) => {
            const cols = row.split(",");
            if (cols.length < 5) return; // Evitar filas incompletas

            const tr = document.createElement("tr");

            cols.forEach(col => {
                const td = document.createElement("td");
                td.textContent = col.trim();
                tr.appendChild(td);
            });

            
            tr.addEventListener("click", () => {
                document.getElementById('userID').value = cols[0].trim();
                document.getElementById('firstName').value = cols[1].trim();
                document.getElementById('lastName').value = cols[2].trim();
                document.getElementById('username').value = cols[3].trim();
                document.getElementById('password').value = cols[4].trim();
            });

            tableBody.appendChild(tr);
        });
    };

    reader.readAsText(file);
});



document.getElementById('saveStudentButton').addEventListener('click', async () => {
    // 🔵 Cerrar el modal al instante
    let modal = bootstrap.Modal.getInstance(document.getElementById('agregarAlumnoModal'));
    if (!modal) {
        modal = new bootstrap.Modal(document.getElementById('agregarAlumnoModal'));
    }
    modal.hide();

    // Luego sigues con la lógica para enviar los datos
    const rows = document.querySelectorAll('#userTable tbody tr');
    const alumnos = [];

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 5) return;

        const alumno = {
            id_usuario: cells[0].textContent.trim(),
            nombre: cells[1].textContent.trim(),
            apellido: cells[2].textContent.trim(),
            username: cells[3].textContent.trim(),
            password: cells[4].textContent.trim()
        };

        if (Object.values(alumno).every(val => val !== '')) {
            alumnos.push(alumno);
        }
    });

    if (alumnos.length === 0) {
        alert('No hay alumnos válidos para enviar.');
        return;
    }

    try {
        const response = await fetch(`${api_url}/agregar_alumno`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ alumnos })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`✅ Agregados: ${data.agregados.length}\n⚠️ Duplicados: ${data.duplicados.length}`);
        } else {
            alert(data.message || 'Error al agregar alumnos.');
        }
    } catch (error) {
        console.error('Error al enviar los datos:', error);
        alert('Ocurrió un error al enviar los datos.');
    }
});


const agregarAlumnoModal = document.getElementById('agregarAlumnoModal');

agregarAlumnoModal.addEventListener('hidden.bs.modal', () => {
    // Limpiar campos ocultos
    document.getElementById('userID').value = '';
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';

    // Limpiar archivo subido
    document.getElementById('csvUpload').value = '';

    // Opcional: limpiar la tabla de usuarios si quieres
    const tbody = document.getElementById('userTable').querySelector('tbody');
    tbody.innerHTML = '';

    // Opcional: resetear todo el formulario
    document.getElementById('studentForm').reset();
});

function eliminarCurso(codCurso) {
    console.log("Eliminando curso con código:", codCurso);  // Depuración
    fetch('/delete_course', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ course_id: codCurso })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Curso eliminado exitosamente') {
            // Verificar si el elemento está presente antes de eliminarlo
            const cursoElement = document.getElementById(codCurso);
            if (cursoElement) {
                console.log("Elemento encontrado en el DOM: ", cursoElement);
                cursoElement.remove();
            } else {
                console.error('Elemento de curso no encontrado en el DOM');
            }
        } else {
            console.error('Error al eliminar el curso:', data.message);
        }
    })
    .catch(err => {
        console.error('Error al eliminar el curso:', err);
    });
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
  




 