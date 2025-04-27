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
            <div class="profesor-card" id="card-${curso[0].cod}" style="position: relative;">
                <a href='course' style="text-decoration: none; color: inherit;">
                    <img class="card-img-top" src="../images/educacion.png" alt="Card image cap">
                    
                    <img src="../images/three_dots.png" alt="Opciones" class="three-dots-icon" style="position: absolute; top: 5px; right: 5px; width: 40px; height: 40px; cursor: pointer;" onclick="toggleMenuOptions(event, '${curso[0].cod}')">
        
                    <div class="options-menu" id="menu-${curso[0].cod}" style="display: none; position: absolute; top: 30px; right: 10px; background-color: white; border: 1px solid #ccc; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); z-index: 100;">
                        <button class="menu-option" onclick="event.preventDefault(); event.stopPropagation(); editarCurso('${curso[0].cod}');">Editar</button>
                        <button class="menu-option" onclick="event.preventDefault(); event.stopPropagation(); eliminarCurso('${curso[0].cod}');">Borrar</button>
                    </div>
                    
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


function toggleMenuOptions(event, courseKey) {
    event.preventDefault(); // Evita que el clic en la imagen cause navegación
    event.stopPropagation(); // Evita que el evento se propague al enlace

    const menu = document.getElementById(`menu-${courseKey}`);

    if (menu.style.display === 'block') {
        menu.style.display = 'none';
    } else {
        const allMenus = document.querySelectorAll('.options-menu');
        allMenus.forEach(m => m.style.display = 'none');

        menu.style.display = 'block';
    }
}


// Función para cerrar el menú si se hace clic fuera de él
document.addEventListener('click', function(event) {
    const menus = document.querySelectorAll('.options-menu');
    menus.forEach(menu => {
        if (!menu.contains(event.target) && !menu.previousElementSibling.contains(event.target)) {
            menu.style.display = 'none';
        }
    });
});



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

    if (!courseName || !courseKey) {
        alert("El nombre y la clave del curso son obligatorios.");
        return;
    }

    // Capturamos los alumnos seleccionados en una variable temporal
    const alumnosSeleccionados = [...selectedStudents];

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

        // Aquí se crea la tarjeta del curso, como ya lo tenías.
        const card = document.createElement("div");
        card.classList.add("profesor-card");
        card.innerHTML = `
            <a href="#" style="text-decoration: none; color: inherit;">
                <div class="profesor-card-img-container" style="position: relative;">
                    <img class="card-img-top" src="../images/educacion.png" alt="Imagen del curso">
                    <img src="../images/three_dots.png" alt="Opciones" class="three-dots-icon" style="position: absolute; top: 5px; right: 5px; width: 40px; height: 40px; cursor: pointer;">
                    <div class="options-menu" style="display: none; position: absolute; top: 30px; right: 10px; background-color: white; border: 1px solid #ccc; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); z-index: 100;">
                        <button class="menu-option" onclick="event.preventDefault(); event.stopPropagation(); editarCurso('${courseKey}');">Editar</button>
                        <button class="menu-option" onclick="event.preventDefault(); event.stopPropagation(); eliminarCurso('${courseKey}');">Borrar</button>
                    </div>
                </div>
                <div class="profesor-card-body">
                    <h3 class="profesor-card-title">${courseName}</h3>
                    <p class="profesor-card-code">${courseKey}</p>
                    <small class="profesor-card-text">${description}</small>
                </div>
            </a>
        `;
        document.getElementById("profesor_cursos").appendChild(card);

        const threeDotsIcon = card.querySelector('.three-dots-icon');
        threeDotsIcon.addEventListener('click', function(event) {
            event.preventDefault();
            const menu = card.querySelector('.options-menu');
            menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'block' : 'none';
            event.stopPropagation();
        });

        document.addEventListener('click', function(event) {
            const menu = card.querySelector('.options-menu');
            if (menu && menu.style.display === 'block' && !menu.contains(event.target) && !card.contains(event.target)) {
                menu.style.display = 'none';
            }
        });

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




const filterInput = document.getElementById('filterInput');
const coursesContainer = document.getElementById('profesor_cursos');


filterInput.addEventListener('input', function () {
    const filterValue = this.value.toLowerCase(); 
    const courseCards = coursesContainer.querySelectorAll('.profesor-card'); 

    courseCards.forEach(card => {
        const courseTitle = card.querySelector('.profesor-card-title').textContent.toLowerCase(); 
        const courseDescription = card.querySelector('.profesor-card-text').textContent.toLowerCase(); 

        
        if (courseTitle.includes(filterValue) || courseDescription.includes(filterValue)) {
            card.style.display = 'block'; 
        } else {
            card.style.display = 'none'; 
        }
    });
});

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
                option.textContent = `${alumno.id} (${alumno.nombre})`;
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
    
    const id_usuario = document.getElementById('userID').value.trim();
    const nombre = document.getElementById('firstName').value.trim();
    const apellido = document.getElementById('lastName').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!id_usuario || !nombre || !apellido || !username || !password) {
        alert('Por favor completa todos los campos.');
        return;
    }

    try {
        const response = await fetch(`${api_url}/agregar_alumno`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id_usuario,
                nombre,
                apellido,
                username,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            
        } else {
            alert(data.message || 'Error al agregar alumno.');
        }
    } catch (error) {
        console.error('Error al enviar los datos:', error);
        alert('Ocurrió un error al enviar los datos.');
    }
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
