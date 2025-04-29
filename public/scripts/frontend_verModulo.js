// let api_url = 'http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io';
let api_url = 'http://localhost:3000';




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
      const res = await fetch(`/modulos/${id}`);
      if (!res.ok) throw new Error('No encontrado');
      const modulo = await res.json();

      // Rellenar contenido del módulo
      document.getElementById('modulo_titulo').textContent = modulo.titulo;
      document.getElementById('modulo_html').innerHTML = modulo.contenido_html;

      // Rellenar iframe del juego
      const juegoSrc = `juegos/index.html?modulo=${modulo.id}`;
      document.getElementById('juego-frame').src = juegoSrc;

      // --- NUEVO: Rellenar Breadcrumb ---
      document.getElementById('breadcrumb-sep-1').classList.remove('d-none');
      document.getElementById('breadcrumb-curso').classList.remove('d-none');
      document.getElementById('breadcrumb-curso').textContent = modulo.cod_curso;
      document.getElementById('breadcrumb-curso').href = `course.html?code=${modulo.cod_curso}`;

      document.getElementById('breadcrumb-sep-2').classList.remove('d-none');
      document.getElementById('breadcrumb-extra').classList.remove('d-none');
      document.getElementById('breadcrumb-extra').textContent = modulo.titulo;

      if (modulo.fecha_entrega) {
        const fechaEntregaFormatted = new Date(modulo.fecha_entrega).toLocaleString('es-ES');
        const contenedor = document.getElementById('modulo_content');
        const fechaEntregaHTML = `
          <div class="alert alert-info mt-4">
            <strong>Fecha límite de entrega:</strong> ${fechaEntregaFormatted}
          </div>`;
        contenedor.insertAdjacentHTML('beforeend', fechaEntregaHTML);
    }

  } catch (err) {
      console.error('Error al cargar el módulo:', err);
      document.getElementById('modulo_content').innerHTML = `
          <div class="alert alert-danger">Módulo no encontrado</div>
      `;
  }
}
