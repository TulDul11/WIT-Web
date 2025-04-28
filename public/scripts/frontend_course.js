let api_url = 'http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io';

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
        await loadCourse();

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

async function loadCourse(){
    const urlParams = new URLSearchParams(window.location.search);
    const courseCode = urlParams.get('code');

    let user_role;
    let data;

    // Llamada para cambiar el curso previamente abierto.
    try {
        const response = await fetch(`${api_url}/previous_course`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                cod: courseCode
            })
        });

        if (!response.ok) {
            if (response.status === 404) {
                user_role_text.textContent = 'Usuario no encontrado';
            } else if (response.status === 401) {
                sessionStorage.setItem('login_error', 'Se requiere iniciar sesión para utilizar la aplicación.');
                window.location.href = '/';
            }
            return;
        }

        data = await response.json();
    } catch (error) {
        console.error('Error:', error);
    }

    
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

    if (user_role == 'Alumno') {
        const alumno_body = document.getElementById('alumno_body');
        alumno_body.style.display = 'flex';
        set_up_alumno('alumnos', data.user_id, courseCode)
    } else {
        const profesor_body = document.getElementById('profesor_body');
        profesor_body.style.display = 'flex';
        set_up_profesor('profesores', data.user_id, courseCode)
    }
}

async function set_up_alumno(user_role, user_id, cod) {
    try {      
        const response = await fetch(`${api_url}/user_courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                user_role: user_role,
                user_id: user_id,
                cod: cod
            })
        });

        if (!response.ok) {
            if (response.status === 404) {
                
                alumno_body.style.display = 'none';
            }
            throw new Error(`Error: ${response.status}`);
        }else{
            const data = await response.json();
        
            const alumno_curso = document.getElementById('alumno_curso');
            const alumno_curso_m = document.getElementById('alumno_curso_m');

            curso = data.course_data[0];

            let carta_curso = `<div class="card p-4" style="width: 90%;margin-inline: auto; min-height: 600px; margin-top: 20px;">
                    <p id="course_title" class="fw-bold mb-4" style="font-size: 2rem;">${curso[0].nombre}</p>
                    <div class="row align-items-center">
                        <div class="col-md-6 mb-4 mb-md-0">
                            <h5 class="fw-bold">${curso[0].nombre}</h5>
                            <p>
                                ${curso[0].descripcion}
                            </p>
                        </div>
                        <div class="col-md " style="min-height: 400px; display: flex; margin-inline: auto; justify-content: center;">
                            <img src="./images/${curso[0].img}" class="img-fluid rounded" id="course_img" style="max-width: 80%; max-height: 450px;" alt="Lavadora" onerror="fixImg()" />
                        </div>
                    </div>
        
                    <p class="fw-bold fs-5 mb-2">Progreso del curso:</p>
                    <div class="progress">
                        <div class="progress-bar progress-bar-animated" role="progressbar" style="width: 50%;background-color: #F1B300 !important" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">50%</div>
                    </div>
                </div>`
            
            alumno_curso.innerHTML += carta_curso;
            alumno_curso_m.innerHTML += carta_curso;
        }

        const hresponse = await fetch(`${api_url}/user_homework`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                user_role: user_role,
                user_id: user_id,
                cod: cod
            })
        });
        const tareas_lista = document.getElementById('tareas_lista');
        const tareas_lista_m = document.getElementById('tareas_lista_m');
        if (!hresponse.ok) {
            if (response.status === 404) {
                tareas_lista.innerHTML = `<a href="#" class="list-group-item list-group-item-action">No hay tareas pendientes</a>`;
            }
            throw new Error(`Error: ${response.status}`);
        }else{
            
            const hdata = await hresponse.json();

            for(let tarea of hdata) {
                let fecha_entrega = new Date(tarea.fecha_entrega);
                const formatter = new Intl.DateTimeFormat('en-US', {hour: '2-digit', minute: '2-digit'});
                var options = {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                };
                const formattedTime = formatter.format(fecha_entrega);

                let item_tarea = `<a href="verModulo.html?id=${tarea.id_tarea}" class="list-group-item list-group-item-action">
                                    <p>${tarea.titulo}<br><span class="item_tarea">${fecha_entrega.toLocaleDateString("es-ES", options)} ${formattedTime}</span><br></p>
                                </a>`
                tareas_lista.innerHTML += item_tarea;
                tareas_lista_m.innerHTML += item_tarea;
            }
        }

        const accordion = document.getElementById('accordionModulos');

        try {
            const res = await fetch('/modulos');
            const modulos = await res.json();

            if (modulos.length === 0) {
                accordion.innerHTML = `<div class="text-center p-3 text-muted">No hay módulos creados todavía.</div>`;
                return;
            }

            modulos.forEach((modulo, index) => {
                const item = document.createElement('div');
                item.classList.add('accordion-item');

                item.innerHTML = `
                <h2 class="accordion-header" id="heading-${index}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${index}" aria-expanded="false" aria-controls="collapse-${index}">
                    ${modulo.titulo}
                    </button>
                </h2>
                <div id="collapse-${index}" class="accordion-collapse collapse" aria-labelledby="heading-${index}">
                    <div class="accordion-body">
                    <p>${modulo.descripcion || 'Contenido del módulo cargado.'}</p>
                    <a href="verModulo.html?id=${modulo.id}" class="btn btn-sm btn-primary me-2">Ver</a>
                    <a href="crearModulos.html?modo=editar&id=${modulo.id}" class="btn btn-sm btn-secondary">Editar</a>
                    </div>
                </div>
                `;

                accordion.appendChild(item);
            });
        } catch (err) {
        accordion.innerHTML = `<div class="alert alert-danger">Error al cargar módulos</div>`;
        console.error(err);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

async function set_up_profesor(user_role, user_id, cod) {
    try{
        
    }catch(error) {
        console.error('Error:', error);
    }
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

function home_screen() {
    window.location.href = './home';
}