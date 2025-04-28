let api_url = 'http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io';


window.addEventListener('load', async () => {
    let user_role;
    let data;
    //const course_code_text = document.getElementById('course_code');
    const user_role_text = document.getElementById('nav_role');
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
        
        const alumno_body = document.getElementById('alumno_body');
        const profesor_body = document.getElementById('profesor_body');
        
        //mostrar seccion correspondiente
        if (data.user_role === 'profesor') {
            alumno_body.style.display = 'none';
            profesor_body.style.display = 'block';
        } else {
            profesor_body.style.display = 'none';
            alumno_body.style.display = 'flex'; // flex porque las tarjetas de alumno usan flex
        }

        //Ocultar boton de crear modulo si no eres profesor
        const botonCrearModulo = document.getElementById('btn-crear-modulo'); // recuerda poner id al botón
        if (botonCrearModulo && data.user_role !== 'profesor') {
            botonCrearModulo.style.display = 'none';
        }

    } catch (error) {
        console.error('Error:', error);
    }

    user_role = data.user_role == 'alumno' ? 'Alumno' : 'Profesor';
    user_role_text.textContent = user_role;

    const urlParams = new URLSearchParams(window.location.search);
    const courseCode = urlParams.get('code');
    //course_code_text.textContent = courseCode;


    if (user_role == 'Alumno') {
        const alumno_body = document.getElementById('alumno_body');
        alumno_body.style.display = 'flex';
        set_up_alumno('alumnos', data.user_id, courseCode)
    } else {
        const profesor_body = document.getElementById('profesor_body');
        profesor_body.style.display = 'flex';
        set_up_profesor('profesores', data.user_id, courseCode)
    }

    const params = new URLSearchParams(window.location.search);
    const codCurso = params.get('code') || 'Curso'; // Usa el nombre correcto de tu parámetro (puede ser "code" o "cod")

    const btnCrearModulo = document.getElementById('btn-crear-modulo');
    if (codCurso && btnCrearModulo) {
        btnCrearModulo.href = `crearModulos.html?modo=crear&cod=${codCurso}`;
    } else {
        console.error('No se encontró código del curso en el URL');
        btnCrearModulo.href = '#'; // No hace nada si no hay código
    }

    if (courseCode) {
        actualizarBreadcrumb({ curso: courseCode });
    } else {
        actualizarBreadcrumb({});
    }


})

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
                //const course_code_text = document.getElementById('course_code');
                const alumno_body = document.getElementById('alumno_body');
                //course_code_text.textContent = 'No esta inscrito en este curso';
                alumno_body.style.display = 'none';
            }
            throw new Error(`Error: ${response.status}`);
        }else{
            const data = await response.json();
        
            const alumno_curso = document.getElementById('alumno_curso');
            const alumno_curso_m = document.getElementById('alumno_curso_m');

            curso = data.course_data[0];

            let carta_curso = `<div class="card p-4" style="width: 90%;margin-inline: auto;">
                        <p id="course_title" class="fw-bold mb-4" style="font-size: 2rem;">${curso[0].nombre}</p>
                        <div class="row align-items-center">
                            <div class="col-md-6 mb-4 mb-md-0">
                                <h5 class="fw-bold">${curso[0].nombre}</h5>
                                <p>
                                    ${curso[0].descripcion}
                                </p>
                            </div>
                            <div class="col-md-6 text-center">
                                <img src="./images/${curso[0].img}" class="img-fluid rounded" style="max-width: 80%; max-height: 450px;" alt="Lavadora" />
                            </div>
                        </div>
            
                        <p class="fw-bold fs-5 mb-2">Progreso del curso:</p>
                        <div class="progress">
                            <div class="progress-bar progress-bar-animated bg-warning" role="progressbar" style="width: 50%" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">50%</div>
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

        const modulosListaAlumno = document.getElementById('modulos-alumno-lista');

        try {
            const res = await fetch(`/modulos?cod=${cod}`);
            const modulos = await res.json();
        
            if (modulos.length === 0) {
                leccionesContainer.innerHTML = `<div class="text-center p-3 text-muted">No hay módulos creados todavía.</div>`;
                return;
            }
        
            modulos.forEach(modulo => {
                const item = document.createElement('a');
                item.className = 'list-group-item list-group-item-action';
                item.href = `verModulo.html?id=${modulo.id}`; // Asumiendo que tienes esta página
                item.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-semibold">${modulo.titulo}</span>
                        ${modulo.tarea === 1 ? '<span class="badge bg-warning text-dark">Tarea</span>' : ''}
                    </div>
                `;
                modulosListaAlumno.appendChild(item);
            });
        } catch (err) {
            modulosListaAlumno.innerHTML = `<div class="alert alert-danger">Error al cargar módulos</div>`;
            console.error(err);
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

async function set_up_profesor(user_role, user_id, cod) {
    try {
        const modulos_profesor = document.getElementById('modulos_profesor');

        // Llamamos al backend para traer los módulos
        const res = await fetch(`/modulos?cod=${cod}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            modulos_profesor.innerHTML = `<div class="alert alert-danger">Error al cargar módulos</div>`;
            throw new Error('Error al obtener módulos');
        }

        const modulos = await res.json();

        // Verificamos si hay módulos
        if (modulos.length === 0) {
            modulos_profesor.innerHTML = `<div class="text-center p-3 text-muted">No hay módulos creados todavía.</div>`;
            return;
        }

        // Creamos una tarjeta para cada módulo
        modulos.forEach(modulo => {
            const item = document.createElement('div');
            item.className = 'list-group-item d-flex justify-content-between align-items-center border-0 border-bottom';
            
            item.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <i class="fas fa-file-alt text-muted"></i>
                <div class="fw-semibold">${modulo.titulo}</div>
            </div>
            <div class="d-flex gap-2">
                <a href="crearModulos.html?modo=editar&id=${modulo.id}" class="btn btn-sm btn-outline-primary">Editar</a>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarModulo(${modulo.id})">Eliminar</button>
            </div>
        `;
        
            
            modulos_profesor.appendChild(item);
            
        });

    } catch (error) {
        console.error('Error en set_up_profesor:', error);
    }
}

async function eliminarModulo(moduloId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este módulo? Esta acción no se puede deshacer.')) {
        return;
    }

    try {
        const res = await fetch(`/modulos/${moduloId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            throw new Error('Error al eliminar el módulo');
        }

        alert('Módulo eliminado exitosamente.');
        window.location.reload(); // Recargamos para refrescar la lista

    } catch (error) {
        console.error('Error al eliminar módulo:', error);
        alert('No se pudo eliminar el módulo.');
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
  




