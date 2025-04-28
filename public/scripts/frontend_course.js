// let api_url = 'http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io';
let api_url = 'http://localhost:3000'; 

window.addEventListener('load', async () => {
    let user_role;
    let data;
    const course_code_text = document.getElementById('course_code');
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
    } catch (error) {
        console.error('Error:', error);
    }

    user_role = data.user_role == 'alumno' ? 'Alumno' : 'Profesor';
    user_role_text.textContent = user_role;

    const urlParams = new URLSearchParams(window.location.search);
    const courseCode = urlParams.get('code');
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
                const course_code_text = document.getElementById('course_code');
                const alumno_body = document.getElementById('alumno_body');
                course_code_text.textContent = 'No esta inscrito en este curso';
                alumno_body.style.display = 'none';
            }
            throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
    
        const alumno_curso = document.getElementById('alumno_curso');
        const alumno_curso_m = document.getElementById('alumno_curso_m');

        curso = data.course_data[0];

        console.log(data);

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

        console.log(dashboard_data);

        set_up_charts();
        

    }catch(error) {
        console.error('Error:', error);
    }
}

async function set_up_charts() {
    console.log('Setting up charts...');
    var labels = [
        "Emma", "Liam", "Olivia", "Noah", "Ava", "Elijah", "Isabella", "James", "Sophia", "Benjamin",
        "Mia", "Lucas", "Charlotte", "Mason", "Amelia", "Ethan", "Harper", "Alexander", "Evelyn", "Henry",
        "Abigail", "Sebastian", "Emily", "Jack", "Ella", "Daniel", "Scarlett", "Matthew", "Luna", "Michael"
    ];
    var yValues = [
        71, 98, 73, 95, 70, 99, 74, 100, 76, 97,
        72, 96, 78, 93, 75, 94, 77, 92, 79, 91,
        80, 90, 81, 89, 82, 88, 83, 87, 84, 85
    ];
    
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
                position: 'top' // <-- move the numeric scale to the top
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