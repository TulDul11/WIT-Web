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

        
        
        configurarBotonCrearModulo();
        
        
        
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
    const course_code_text = document.getElementById('course_code');

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
                course_code_text.textContent = 'Usuario no encontrado';
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
    course_code_text.textContent = courseCode;

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
        }
        
        const data = await response.json();
    
        const alumno_curso = document.getElementById('alumno_curso');
        const alumno_curso_m = document.getElementById('alumno_curso_m');

        curso = data.course_data[0];

        const imgSrc = curso[0].img;
        const result = await fetch(`images/${imgSrc}`);
        
        if (!result.ok) {
            curso[0].img = 'whirlpool_logo.png';
        }

        let carta_curso = `<div class="card p-4" style="width: 90%;margin-inline: auto; min-height: 600px;">
                    <p id="course_title" class="fw-bold mb-4" style="font-size: 2rem;">${curso[0].nombre}</p>
                    <div class="row align-items-center">
                        <div class="col-md-6 mb-4 mb-md-0">
                            <h5 class="fw-bold">${curso[0].nombre}</h5>
                            <p>
                                ${curso[0].descripcion}
                            </p>
                        </div>
                        <div class="col-md-6 " style="min-height: 400px; display: flex; align-items: center;">
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
        }
            
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
                item.href = `verModulo.html?id=${modulo.id}`; // cargar pagina para visualizacion de modulos solo para alumno
                item.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <span>${modulo.titulo}</span>
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

    try{
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
                const course_code_text = document.getElementById('course_code');
                const profesor_body = document.getElementById('profesor_body');
                course_code_text.textContent = 'No esta asignado a este curso';
                profesor_body.style.display = 'none';
            }
            throw new Error(`Error: ${response.status}`);
        }

        const dashboard_response = await fetch(`${api_url}/dashboard`, {
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
        
        const dashboard_data = await dashboard_response.json();

        document.getElementById('course_name').textContent = dashboard_data[0];
        document.getElementById('num_tec').textContent = dashboard_data[1];

        console.log(dashboard_data[2]);

        set_up_charts(dashboard_data[2]);
        

    }catch(error) {
        console.error('Error:', error);
    }
}

async function set_up_charts(stats) {
    console.log('Setting up charts...');
    var labels = [];
    var yValues = [];

    for(let tecnico of stats){
        labels.push(tecnico.nombre);
        yValues.push(Math.round((tecnico.tareas_completadas / tecnico.tareas) * 100));
    }
    
    var result = {};
    for (var i = 0; i < labels.length; i++) {
        result[labels[i]] = yValues[i];
    }

    const entries = Object.entries(result);
    entries.sort();
    result = Object.fromEntries(entries);

    var data = {
        labels: Object.keys(result),
        datasets: [{
            axis: 'y',
            label: 'Progreso',
            data: Object.values(result),
            fill: false,
            backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(201, 203, 207, 0.2)'
            ],
            borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)'
            ],
            borderWidth: 1,
            barThickness: 50,
        }]
    };

    let config = {
        type: 'bar',
        data,
        options: {
            indexAxis: 'y',
            maintainAspectRatio: false,
            plugins: {
            legend: {
                display: false
            }
            },
            scales: {
            x: {
                beginAtZero: true,
                grace: 10,
                position: 'top', // <-- move the numeric scale to the top
                max: 100
            },
            y: {
                position: 'left' // (this keeps the names on the left, default)
            }
            }
        }
    };

    const bar_chart = new Chart(document.getElementById('bar_chart'),config);

    const bar_body = document.getElementById('bar_body');
    if(bar_chart.data.labels.length > 5){
        const newHeight = 700 + (bar_chart.data.labels.length - 5) * 50;
        bar_body.style.height = `${newHeight}px`;
    }

    data = {
        labels: [
            'Introducción a las lavadoras',
            'Principios de funcionamiento',
            'Diagnóstico de fallas comunes',
            'Reemplazo de bombas de agua',
            'Reparación de motores',
            'Mantenimiento preventivo',
            'Solución de problemas eléctricos'
        ],
        datasets: [{
            label: 'Progreso',
            data: [65, 59, 90, 81, 56, 55, 40],
            fill: true,
            backgroundColor: 'rgba(117, 200, 255, 0.47)',
            borderColor: 'rgb(67, 180, 255)',
            pointBackgroundColor: 'rgb(67, 180, 255)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(255, 99, 132)'
        }]
    };

    config = {
        type: 'radar',
        data: data,
        options: {
            maintainAspectRatio: false,
            elements: {
            line: {
                borderWidth: 3
            }
            },
            plugins: {
            legend: {
                display: false
            }
            },
        }
    };

    const radar_chart = new Chart(document.getElementById('radar_chart'), config);
}

async function sort_chart(order) {

    const chart = Chart.getChart('bar_chart');

    var labels = chart.data.labels;
    var values = chart.data.datasets[0].data;

    var result = {};
    for (var i = 0; i < labels.length; i++) {
        result[labels[i]] = values[i];
    }

    const entries = Object.entries(result);

    switch (order) {
        case 1:
            entries.sort((a, b) => a[1] - b[1]); 
            const sortedAsc = Object.fromEntries(entries);
            chart.data.labels = Object.keys(sortedAsc);
            chart.data.datasets[0].data = Object.values(sortedAsc);
            break;
        case 2:
            entries.sort((a, b) => b[1] - a[1]); 
            const sortedDesc = Object.fromEntries(entries);
            chart.data.labels = Object.keys(sortedDesc);
            chart.data.datasets[0].data = Object.values(sortedDesc);
            break;
        case 3:
            entries.sort();
            const sortedAz = Object.fromEntries(entries);
            chart.data.labels = Object.keys(sortedAz);
            chart.data.datasets[0].data = Object.values(sortedAz);
            break;
        case 4:
            entries.sort().reverse();
            const sortedZa = Object.fromEntries(entries);
            chart.data.labels = Object.keys(sortedZa);
            chart.data.datasets[0].data = Object.values(sortedZa);
            break;
    }
    chart.update();
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
  

function configurarBotonCrearModulo() {
  const params = new URLSearchParams(window.location.search);
  const codCurso = params.get('code');

  if (codCurso) {
    const crearModuloBtn = document.getElementById('btn-crear-modulo');
    if (crearModuloBtn) {
        crearModuloBtn.href = `crearModulos.html?modo=crear&cod=${codCurso}`;
    }
  }
}



