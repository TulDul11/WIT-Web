//let api_url = 'http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io';
let api_url = 'http://localhost:3000'


// --- Evento principal ---
document.addEventListener('DOMContentLoaded', async () => {

    try {
        const response = await fetch(`${api_url}/user_home`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            window.location.href = '/'; // Redirige a login si no está logueado
            return;
        }

        const data = await response.json();

        // Mostrar el rol (profesor/alumno)
        const user_role_text = document.getElementById('nav_role');
        const user_role = data.user_role === 'alumno' ? 'Alumno' : 'Profesor';
        if (user_role_text) {
            user_role_text.textContent = user_role;
        }

        if (data.user_role !== 'profesor') {
            // Si no es profesor, redirigir
            window.location.href = '/home.html'; // O a la página principal que quieras
            return;
        }
        // Si todo está bien, ahora sí seguir cargando el contenido de crear módulos
        console.log('Acceso permitido: Profesor');
        
    } catch (error) {
        console.error('Error verificando sesión:', error);
        window.location.href = '/'; // En cualquier error, mejor redirigir al login
    }
    
    const params = new URLSearchParams(window.location.search);
    const modo = params.get('modo');
    const id = params.get('id');
    codCurso = params.get('cod');
    moduloGuardadoId = id;
    if (modo === 'editar' && id) {
        moduloGuardadoId = parseInt(id);
        console.log('ID recuperado del URL:', moduloGuardadoId);
    }
    
    if (modo === 'editar' && !codCurso && id) {
        console.log('ID recuperado del URL:', moduloGuardadoId);
        // Recuperar cod_curso del backend usando el id del módulo
        try {
            const res = await fetch(`/modulos/${id}`);
            if (!res.ok) throw new Error('Error recuperando módulo');
            const modulo = await res.json();
            console.log('DEBUG modulo cargado:', modulo);

            codCurso = modulo.cod_curso;
            console.log('cod_curso recuperado del backend:', codCurso);

            //Actualizar la url del navergador sin mostrar el cod
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('cod', codCurso);
            window.history.replaceState({}, '', currentUrl);


        } catch (err) {
            console.error('Error al recuperar cod_curso:', err);
            alert('No se pudo recuperar el código del curso. Algunas funciones pueden fallar.');
        }
    }


    //cambiar boton guardar/crear dinamicamente
    const btnGuardarModulo = document.getElementById('btn-save');
    if(modo === 'crear') {
        btnGuardarModulo.textContent = 'Crear Módulo';
        btnGuardarModulo.classList.remove('btn-primary');
        btnGuardarModulo.classList.add('btn-success'); // Verde para crear

    } else {
        btnGuardarModulo.textContent = 'Guardar Modulo';
        btnGuardarModulo.classList.remove('btn-success');
        btnGuardarModulo.classList.add('btn-primary'); // Azul para guardar
    }


    // Configurar previsualizar
    btnPreview.addEventListener('click', () => {
        const titulo = document.getElementById('module-title').value;
        const contenido = quill.root.innerHTML;

        document.getElementById('preview-title').textContent = titulo;
        document.getElementById('preview-title').style.display = 'block';
        document.getElementById('module-title-wrapper').style.display = 'none';

        previewContainer.innerHTML = contenido;
        editorWrapper.style.display = 'none';
        previewContainer.style.display = 'block';
        pageTitle.style.display = 'none';
        btnPreview.style.display = 'none';
        btnEdit.style.display = 'inline-block';
    });

    btnEdit.addEventListener('click', () => {
        editorWrapper.style.display = 'block';
        previewContainer.style.display = 'none';
        document.getElementById('preview-title').style.display = 'none';
        document.getElementById('module-title-wrapper').style.display = 'block';
        pageTitle.style.display = 'block';
        btnPreview.style.display = 'inline-block';
        btnEdit.style.display = 'none';
    });

    // Cargar módulo y preguntas si estamos editando
    if (modo === 'editar' && id) {
        try {
            const res = await fetch(`/modulos/${id}`);
            if (!res.ok) throw new Error('No encontrado');
            const modulo = await res.json();
            

            document.getElementById('module-title').value = modulo.titulo;
            quill.root.innerHTML = modulo.contenido_html;

            if (modulo.tarea === 1) {
                tipoModulo = 'tarea';
            } else {
                tipoModulo = 'leccion';
            }
            if (modulo.fecha_entrega) {
                const fechaInput = document.getElementById('fecha-entrega');
                if (fechaInput) {
                    // Si el formato de fecha es correcto, simplemente lo ponemos
                    fechaInput.value = modulo.fecha_entrega.replace(' ', 'T'); // Para adaptarlo al tipo datetime-local
                }
            }            

            const pregRes = await fetch(`/modulos/${id}/preguntas`);
            const preguntas = await pregRes.json();

            Alpine.store('bancoPreguntas').preguntas = preguntas.map(p => ({
                texto: p.pregunta,
                respuestas: p.opciones,
                correcta: p.correcta,
                abierta: true
            }));

        } catch (err) {
            alert('Error al cargar módulo o preguntas.');
            console.error(err);
        }
    }

    const btnLeccion = document.getElementById('btn-leccion');
    const btnTarea = document.getElementById('btn-tarea');
    const tipoSelector = document.getElementById('tipo-selector');
    const tipoTexto = document.getElementById('tipo-texto');
    const tipoContenedor = document.getElementById('tipo-contenedor');
    const tipoLabel = document.getElementById('tipo-label');
    const fechaEntrega1 = document.getElementById('fecha-entrega-wrapper')



    // Verificar si estamos editando
    if (modo === 'editar') {
        // Ocultar selector
        tipoSelector?.classList.add('d-none');
        tipoContenedor?.classList.add('d-none');
        tipoLabel?.classList.add('d-none');

        tipoTexto.style.display = 'block';
        tipoTexto.textContent = `Tipo de módulo: ${tipoModulo === 'tarea' ? 'Tarea' : 'Lección'}`;
        
        pageTitle.textContent = "Editar Contenido del Módulo";

        // Cargar datos del módulo y aplicar condiciones si es tarea
        try {
            const res = await fetch(`/modulos/${id}`);
            if (!res.ok) throw new Error('No encontrado');
            const modulo = await res.json();

            document.getElementById('module-title').value = modulo.titulo;
            quill.root.innerHTML = modulo.contenido_html;

            tipoModulo = modulo.tarea === 1 ? 'tarea' : 'leccion';

            tipoSelector?.classList.add('d-none');
            tipoTexto.style.display = 'block';
            tipoTexto.textContent = `Tipo de módulo: ${tipoModulo === 'tarea' ? 'Tarea' : 'Lección'}`

            // Si el módulo es una tarea, mostrar banco y juego
            if (modulo.tarea === 1) {
                document.getElementById('preguntas-wrapper')?.classList.remove('d-none');
                document.getElementById('juego-wrapper')?.classList.remove('d-none');

                const iframe = document.getElementById('juego-frame');
                if (iframe) {
                    iframe.style.display = 'block';
                    iframe.src = `juegos/index.html?modulo=${id}`;
                }

                // Cargar preguntas
                const pregRes = await fetch(`/modulos/${id}/preguntas`);
                const preguntas = await pregRes.json();

                Alpine.store('bancoPreguntas').preguntas = preguntas.map(p => ({
                    texto: p.pregunta,
                    respuestas: p.opciones,
                    correcta: p.correcta,
                    abierta: true
                }));
            }

        } catch (err) {
            alert('Error al cargar módulo o preguntas.');
            console.error(err);
        }

    } else {
        // Si estamos creando el módulo, permitir seleccionar tipo
        const ayudaTarea = document.getElementById('ayuda-tarea');

        btnLeccion.addEventListener('click', () => {
            tipoModulo = 'leccion';
            console.log('Seleccionado: leccion');
            btnLeccion.classList.replace('btn-outline-secondary', 'btn-primary');
            btnTarea.classList.replace('btn-primary', 'btn-outline-secondary');
            ayudaTarea?.classList.add('d-none');
            fechaEntrega1?.classList.add('d-none');
            

            // Ocultar elementos exclusivos de tarea
            document.getElementById('preguntas-wrapper')?.classList.add('d-none');
            document.getElementById('juego-wrapper')?.classList.add('d-none');
            const iframe = document.getElementById('juego-frame');
            if (iframe) iframe.style.display = 'none';
        });

        btnTarea.addEventListener('click', () => {
            tipoModulo = 'tarea';
            console.log('Seleccionado: tarea');
            btnTarea.classList.replace('btn-outline-secondary', 'btn-primary');
            btnLeccion.classList.replace('btn-primary', 'btn-outline-secondary');
            ayudaTarea?.classList.remove('d-none');
            fechaEntrega1?.classList.remove('d-none');


            // Mostrar elementos exclusivos de tarea
            document.getElementById('preguntas-wrapper')?.classList.add('d-none');
            document.getElementById('juego-wrapper')?.classList.add('d-none');

            const iframe = document.getElementById('juego-frame');
            if (iframe) iframe.style.display = 'block';
        });
    }
    // Aquí agregar el breadcrumb:
    if (modo === 'crear') {
        actualizarBreadcrumb({ curso: codCurso, extra: 'Creación de Módulo' });
    } else if (modo === 'editar' && id) {
        try {
            const res = await fetch(`/modulos/${id}`);
            const modulo = await res.json();
            actualizarBreadcrumb({ curso: codCurso, extra: modulo.titulo });
        } catch (error) {
            console.error('No se pudo cargar título de módulo');
        }
    }

    const breadcrumbCurso = document.getElementById('breadcrumb-curso');
    if (breadcrumbCurso) {
        breadcrumbCurso.style.cursor = 'pointer'; // Opcional: para que el mouse cambie a manita
        breadcrumbCurso.addEventListener('click', () => {
            const params = new URLSearchParams(window.location.search);
            const codCurso = params.get('cod') || params.get('code');
            if (codCurso) {
                window.location.href = `/course.html?code=${codCurso}`;
            } else {
                window.location.href = '/home.html'; // fallback si no hay código
            }
        });
    }

});

// --- Alpine.js Banco de preguntas ---
document.addEventListener('alpine:init', () => {
    Alpine.store('bancoPreguntas', {
        preguntas: [],
        añadirPregunta() {
            this.preguntas.push({ texto: '', respuestas: ['', '', '', ''], correcta: 0, abierta: true });
        },
        eliminarPregunta(index) {
            this.preguntas.splice(index, 1);
        }
    });
});

// --- Configuración del editor Quill ---
const quill = new Quill('#editor-container', {
    theme: 'snow',
    modules: { toolbar: '#toolbar-container' },
    placeholder: 'Escribe aquí el contenido del módulo...'
});

// --- Variables generales ---
let moduloGuardadoId = null;
let tipoModulo = null;
let codCurso = null;
const editorWrapper = document.getElementById('editor-wrapper');
const previewContainer = document.getElementById('preview-container');
const btnPreview = document.getElementById('btn-preview');
const btnEdit = document.getElementById('btn-edit');
const pageTitle = document.getElementById('page-title');

// --- Funciones de navegación ---
function home_screen() {
    window.location.href = './home';
}

// --- Funciones principales ---
function guardarModulo() {
    const titulo = document.getElementById('module-title').value;
    const contenido = quill.root.innerHTML;
    if (tipoModulo === null) {
        alert('Por favor selecciona si este módulo es una Lección o una Tarea antes de guardar.');
        return;
    }
    
    const tarea = tipoModulo === 'tarea' ? 1 : 0;

    const fechaEntregaInput = document.getElementById('fecha-entrega');
    let fechaEntrega = null;
    
    if (fechaEntregaInput && fechaEntregaInput.value) {
        // Convertimos bien a formato completo
        const fecha = new Date(fechaEntregaInput.value);
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        const horas = String(fecha.getHours()).padStart(2, '0');
        const minutos = String(fecha.getMinutes()).padStart(2, '0');
        const segundos = '00'; // Fijo
    
        fechaEntrega = `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
        console.log('Fecha final lista para base de datos:', fechaEntrega);
    }
    


    const params = new URLSearchParams(window.location.search);
    const modo = params.get('modo');
    const id = params.get('id');
    
    if (!codCurso) {
        alert("No se encontró el código del curso. No se puede guardar el módulo.");
        return;
    }

    let metodo, url;

    if (modo === 'editar' && id) {
        metodo = 'PUT';
        url = `/modulos/${id}`;
    } else {
        metodo = 'POST';
        url = '/modulos';
    }
    console.log('Tipo de módulo en guardar:', tipoModulo);

    console.log('Fecha de entrega: ',fechaEntrega);

    fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, contenido, tarea, cod_curso: codCurso, fecha_entrega: fechaEntrega })
    })
    .then(res => res.json())
    .then(data => {
        moduloGuardadoId = modo === 'editar' ? parseInt(id) : data.moduloId;
        alert(`Módulo ${modo === 'editar' ? 'actualizado' : 'creado'} con ID: ${moduloGuardadoId}`);

        if( modo === 'crear' ) {
            //const codCurso = new URLSearchParams(window.location.search).get('cod');
            window.location.href = `crearModulos.html?modo=editar&id=${moduloGuardadoId}&cod=${codCurso}`;
            return;
        }
        
        if (tarea === 1) {
            const btnProbar = document.getElementById('probar-juego');
            const iframe = document.getElementById('juego-frame');
            const wrapper = document.getElementById('juego-wrapper');
        
            if (btnProbar && iframe && wrapper) {
                btnProbar.classList.remove('d-none');
                wrapper.classList.remove('d-none');
                btnProbar.onclick = () => {
                    iframe.src = `juegos/index.html?modulo=${moduloGuardadoId}`;
                    iframe.style.display = 'block';
                };
            }
        }
    
    })
    .catch(() => alert("Error al guardar el módulo"));

    
}

function guardarPreguntas() {
    if (!moduloGuardadoId || moduloGuardadoId === 'null') {
        console.error('No hay módulo válido para guardar preguntas.');
        alert("No se puede guardar preguntas porque el módulo no existe o no ha sido guardado correctamente.");
        return;
    }

    const preguntas = JSON.parse(JSON.stringify(Alpine.store('bancoPreguntas')?.preguntas || []));
    console.log("Preguntas a enviar:", preguntas);

    fetch(`/modulos/${moduloGuardadoId}/preguntas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preguntas })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || "Preguntas guardadas correctamente.");

        // REFRESCAR EL JUEGO
        const iframe = document.getElementById('juego-frame');
        if (iframe) {
            // Forzar reload para que tome las nuevas preguntas
            iframe.src = `juegos/index.html?modulo=${moduloGuardadoId}&t=${Date.now()}`;
        }
    })
    .catch(error => {
        console.error("Error al guardar preguntas:", error);
        alert("Error al guardar las preguntas.");
    });
}

function construirBreadcrumb(items) {
    const breadcrumb = document.getElementById('breadcrumb-nav');
    if (!breadcrumb) return; // Si no existe el nav, no hace nada
    breadcrumb.innerHTML = '';

    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'breadcrumb-item';

        if (index === items.length - 1) {
            li.classList.add('active');
            li.setAttribute('aria-current', 'page');
            li.textContent = item.nombre;
        } else {
            const a = document.createElement('a');
            a.href = item.url;
            a.textContent = item.nombre;
            li.appendChild(a);
        }

        breadcrumb.appendChild(li);
    });
}

const params = new URLSearchParams(window.location.search);
const modo = params.get('modo');

const nombreUltimoPaso = (modo === 'editar') ? 'Editar Módulo' : 'Crear Módulo';


    
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
  