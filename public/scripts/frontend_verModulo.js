let api_url = 'http://l408cggw004w8gwgkcwos00c.172.200.210.83.sslip.io';


// --- Evento principal ---
document.addEventListener('DOMContentLoaded', () => {
  cargarModulo();
});

// --- Funciones de navegación ---
function home_screen() {
  window.location.href = './home';
}

// --- Función para cargar el módulo ---
async function cargarModulo() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  try {
    const res = await fetch(`${api_url}/modulos/${id}`);
    if (!res.ok) throw new Error('No encontrado');
    const modulo = await res.json();

    // Rellenar contenido del módulo
    document.getElementById('modulo_titulo').textContent = modulo.titulo;
    document.getElementById('modulo_html').innerHTML = modulo.contenido_html;


    // Preparar iframe del juego
    let tareaParam = '';
    if (modulo.tarea === 1) {
      const userInfoRaw = localStorage.getItem('user_info');
      const userInfo = JSON.parse(userInfoRaw);

      const body = {
        user_id: userInfo.user_id,
        user_role: userInfo.user_role,
        moduloID: modulo.id
      };

      const tareaRes = await fetch(`${api_url}/tarea_id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const tareaData = await tareaRes.json();
      tareaParam = `&tarea=${tareaData.id_tarea}`;
      await verificarTareaCompletada(modulo.id, tareaData.id_tarea);

    } else {
      const juegoContainer = document.getElementById('juego-container');
      const juegoTitulo = document.getElementById('juego-titulo');
      if(juegoContainer) juegoContainer.style.display = 'none';
      if (juegoTitulo) juegoTitulo.style.display = 'none';
    }

    const juegoSrc = `juegos/index.html?modulo=${modulo.id}${tareaParam}`;
    document.getElementById('juego-frame').src = juegoSrc;

    // Fecha de entrega
    if (modulo.fecha_entrega) {
      const fechaEntregaFormatted = new Date(modulo.fecha_entrega).toLocaleString('es-ES');
      const contenedor = document.getElementById('modulo_content');
      const fechaEntregaHTML = `
        <div class="alert alert-info mt-4">
          <strong>Fecha límite de entrega:</strong> ${fechaEntregaFormatted}
        </div>`;
      contenedor.insertAdjacentHTML('afterbegin', fechaEntregaHTML);
    }



  } catch (err) {
    console.error('Error al cargar el módulo:', err);
    document.getElementById('modulo_content').innerHTML = `
      <div class="alert alert-danger">Módulo no encontrado</div>
    `;
  }
}

async function verificarTareaCompletada(moduloID, idTarea) {
  const userInfoRaw = localStorage.getItem('user_info');
  const userInfo = JSON.parse(userInfoRaw);
  const user_id = userInfo.user_id;

  try {
    const res = await fetch(`${api_url}/estado_tarea?user_id=${user_id}&id_tarea=${idTarea}`);
    if (res.ok) {
      const estado = await res.json();
      if (estado.completado === 1) {
        // Ocultar iframe
        const juegoContainer = document.getElementById('juego-container');
        if (juegoContainer) juegoContainer.style.display = 'none';

        // Mostrar mensaje
        const contenedor = document.getElementById('modulo_content');
        const completadoHTML = `
          <div class="alert alert-success mt-4">
            Esta tarea ya la has completado.
          </div>`;
        contenedor.insertAdjacentHTML('beforeend', completadoHTML);
      }
    }
  } catch (err) {
    console.error("Error al verificar tarea completada:", err);
  }
}

