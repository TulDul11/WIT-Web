let api_url = 'http://l408cggw004w8gwgkcwos00c.172.200.210.83.sslip.io';

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

        await load_sidebar_data();
        
        // Al terminar de cargar contenido estático, cargamos cualquier datos conseguidos a través de la conexión API.
        await loadCourse();

        configurarBotonCrearModulo()

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

                    document.getElementById('tareas_lista').innerHTML = `
                      <li class="list-group-item">No hay tareas pendientes</li>`;
                    document.getElementById('tareas_lista_m').innerHTML = `
                      <li class="list-group-item">No hay tareas pendientes</li>`;

                
                
            }
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        
        const presponse = await fetch(`${api_url}/progreso`, {
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

        const progreso = await presponse.json();
        let is_prog = 'flex';
        if (!presponse.ok) {
            if (presponse.status === 404) {
                is_prog = 'none';
            }
        }

        let prog_percent 
        if(progreso.tareas == 0){
            prog_percent = 0;
        }else{
            prog_percent = Math.round((progreso.tareas_completadas/progreso.tareas)*100);
        }
    
        const alumno_curso = document.getElementById('alumno_curso');
        const alumno_curso_m = document.getElementById('alumno_curso_m');

        // Escondemos documentación técnica de la aplicación (para que no vean los alumnos)
        document.getElementById('sidebar_docs').style.display = 'none';

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
                            <p align="justify">
                                ${curso[0].descripcion}
                            </p>
                        </div>
                        <div class="col-md-6 " style="min-height: 400px; display: flex; justify-content: center; align-items: center;">
                            <img src="./images/${curso[0].img}" class="img-fluid rounded" id="course_img" style="max-width: 80%; max-height: 450px;" alt="Lavadora" onerror="fixImg()" />
                        </div>
                    </div>
        
                    <p class="fw-bold fs-5 mb-2">Progreso del curso:</p>
                    <div class="progress">
                        <div class="progress-bar progress-bar-animated" role="progressbar" style="display: ${is_prog};width: ${prog_percent}%;background-color: #F1B300 !important" aria-valuenow="${prog_percent}" aria-valuemin="0" aria-valuemax="100">${prog_percent + '%'}</div>
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
            if (hresponse.status === 404) {
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
        
    } catch (error) {
        console.error('Error:', error);
    }
    try {
        const modulosListaAlumno = document.getElementById('modulos-alumno-lista');
        const res = await fetch(`${api_url}/modulos?cod=${cod}`);
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
}

async function set_up_profesor(user_role, user_id, cod) {
    try {

        const modulos_profesor = document.getElementById('modulos_profesor');

        // Llamamos al backend para traer los módulos
        const res = await fetch(`${api_url}/modulos?cod=${cod}`, {
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
        document.getElementById('num_mod').textContent = dashboard_data[3];

        set_up_charts(dashboard_data[2], dashboard_data[4]);
        

    }catch(error) {
        console.error('Error:', error);
    }

}

async function set_up_charts(stats, calis) {
    var labels = [];
    var yValues = [];
    let cur_prog;
    var sum = 0;


    for(let tecnico of stats){
        labels.push(tecnico.nombre);
        if(tecnico.tareas){
            cur_prog = Math.round((tecnico.tareas_completadas / tecnico.tareas) * 100);
        }else{
            cur_prog = 0;
        }
        yValues.push(Math.round(cur_prog));
        sum += cur_prog;
    }


    if(sum){
        document.getElementById('prom_prog').textContent = Math.round((sum / yValues.length)*10)/10 + '%';
    }else{
        document.getElementById('prom_prog').textContent = '0%';
    }

    var result = {};
    for (var i = 0; i < labels.length; i++) {
        result[labels[i]] = yValues[i];
    }


    let entries = Object.entries(result);
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
    if(bar_chart.data.labels.length > 1){
        const newHeight = 400 + (bar_chart.data.labels.length - 5) * 50;
        bar_body.style.height = `${newHeight}px`;
    }

    labels = [];
    yValues = [];
    sum = 0;

    for(let promedio of calis){
        labels.push(promedio.nombre);
        let cur_prom = parseFloat(promedio.promedio * 100);
        yValues.push(cur_prom);
        sum += cur_prom;
    }

    if(sum){
        document.getElementById('prom_prom').textContent = Math.round((sum / yValues.length)*10)/10;
    }else{
        document.getElementById('prom_prom').textContent = '0';
    }

    var result = {};
    for (var i = 0; i < labels.length; i++) {
        result[labels[i]] = yValues[i];
    }

    entries = Object.entries(result);
    entries.sort((a, b) => a[1] - b[1]); 
    result = Object.fromEntries(entries);

    data = {
        labels:  Object.keys(result),
        datasets: [{
            label: 'Promedio',
            data: Object.values(result),
            fill: true,
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
            barThickness: 50
        }]
    };

    config = {
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
                position: 'top', // <-- move the numeric scale to the top
                max: 100
            },
            y: {
                position: 'left' // (this keeps the names on the left, default)
            }
            }
        }
    };

    const histogram_chart = new Chart(document.getElementById('histogram_chart'), config);

    const histogram_body = document.getElementById('histogram_body');
    if(histogram_chart.data.labels.length > 1){
        const newHeight2 = 400 + (histogram_chart.data.labels.length - 5) * 50;
        histogram_body.style.height = `${newHeight2}px`;
    }

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
        // Menor a mayor
        case 1:
            entries.sort((a, b) => a[1] - b[1]); 
            const sortedAsc = Object.fromEntries(entries);
            chart.data.labels = Object.keys(sortedAsc);
            chart.data.datasets[0].data = Object.values(sortedAsc);
            break;
        // Mayor a menor
        case 2:
            entries.sort((a, b) => b[1] - a[1]); 
            const sortedDesc = Object.fromEntries(entries);
            chart.data.labels = Object.keys(sortedDesc);
            chart.data.datasets[0].data = Object.values(sortedDesc);
            break;
        // A-z
        case 3:
            entries.sort();
            const sortedAz = Object.fromEntries(entries);
            chart.data.labels = Object.keys(sortedAz);
            chart.data.datasets[0].data = Object.values(sortedAz);
            break;
        // Z-a
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
        const res = await fetch(`${api_url}/modulos/${moduloId}`, {
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
        crearModuloBtn.href = `${api_url}/crearModulos.html?modo=crear&cod=${codCurso}`;
    }
  }
}
