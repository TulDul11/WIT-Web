/*
Función que configurará las barras lateral y de navegación, junto con sus animaciones.
La única configuración en este momento involucra abriendo la barra lateral si la pantalla es mayor a 767 pixeles.
*/
function setup_utilities() {
    const mediaQuery = window.matchMedia('(max-width: 767px)');

    if (!mediaQuery.matches) {
        toggleSidebar();
    }

    animationSetup();
}

/*
Función que cambiará los estados de la barra lateral entre activo y no activo.
*/
function toggleSidebar() {
    // Todos los elementos que requieren ser "activados" y además pueden ser reconocidos por su ID.
    let items = ["sidebar", "menu_button", "sidebar_top", "sidebar_bottom", "sidebar_role", "sidebar_home",
                "sidebar_previous", "sidebar_logout", "sidebar_courses", "menu_button_2", "sidebar_overlay"
    ];

    // Le asignamos la clase de "activo" a los elementos anteriores.
    items.forEach((item) => {
        document.getElementById(item).classList.toggle("active");
    });

    // Cada curso mostrado en la barra lateral en la lista de cursos.
    const sidebar_courses_items = document.querySelectorAll('.sidebar_courses_item');

    // A cada curso le asignamos la clase de "activo".
    sidebar_courses_items.forEach(course => {
        course.classList.toggle("active");
    });

    // El contenido principal de la página web.
    const content_bodies = document.querySelectorAll('.content_body');

    // Al contenido principal le asignamos la clase de "activo".
    content_bodies.forEach(body => {
        body.classList.toggle("active");
    });
};

/*
Función que abre la barra lateral con el botón de todos los cursos.
La diferencia entre está función y la función de toggleSidebar() es que está función solo funciona cuando la barra lateral no está activada.
*/
function coursesOpenSidebar() {
    const sidebar_courses = document.getElementById('sidebar_courses');

    if (!sidebar_courses.classList.contains('active')) {
        toggleSidebar();
    }
};

/*
Función que agrega la animación a cada cuadro de texto.
La animación se centra en mover el texto a través de todo el contenedor (de derecha a izquieda) hasta que todo el texto se haya desplegado y se haya podido leer.
*/
function addAnimation(containerElement, textElement, offset) {
    let animationFrame;
    let resetTimeout;
    let pos = 0;
    
    // Cuando el ratón entra sobre el contenedor, empieza la animación.
    containerElement.addEventListener('mouseenter', () => {
        if (!containerElement.classList.contains('active')) {
        return;
        }

        const containerWidth = containerElement.offsetWidth;
        const textWidth = textElement.scrollWidth;

        if (textWidth > containerWidth) {
        pos = 0;

        function animate() {
            pos -= 2;
            textElement.style.transform = `translateX(${pos}px)`;

            if (Math.abs(pos) >= textWidth - containerWidth + offset) {
                cancelAnimationFrame(animationFrame);
                resetTimeout = setTimeout(() => {
                    pos = 0;
                    textElement.style.transform = `translateX(0)`;
                    animationFrame = requestAnimationFrame(animate);
                }, 1000);
            } else {
                animationFrame = requestAnimationFrame(animate);
            }
        }

        resetTimeout = setTimeout(() => {
            animationFrame = requestAnimationFrame(animate);
        }, 300);
        };
    });

    // Cuando el ratón sale del contendor, termina la animación y pone el texto en su posición inicial.
    containerElement.addEventListener('mouseleave', () => {
        if (!containerElement.classList.contains('active')) {
            return;
        }
        
        cancelAnimationFrame(animationFrame);
        clearTimeout(resetTimeout);
        textElement.style.transform = 'translateX(0)';
        pos = 0;
    });
};

/*
Función que prepara los elementos para agregarles las animaciones.
*/
function animationSetup() {
    // Contenedor y texto que habla acerca del curso previamente visto.
    const sidebar_previous = document.getElementById('sidebar_previous');
    const sidebar_previous_course = document.getElementById("sidebar_previous_course");

    addAnimation(sidebar_previous, sidebar_previous_course, 61);

    // Contenedores y textos de cada curso perteneciente al usuario.
    const sidebar_courses_items = document.querySelectorAll('.sidebar_courses_item');

    sidebar_courses_items.forEach(course => {
        const text = course.querySelector('.sidebar_courses_item_text');
        
        addAnimation(course, text, 30);
    });
};