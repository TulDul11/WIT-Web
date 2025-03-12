function toggleMenu(icon) {
    let menu = icon.nextElementSibling; // Encuentra el menú al lado de la imagen
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

function editCard() {
    alert("Editar tarjeta");
}

function deleteCard(button) {
    let card = button.closest(".card"); // Encuentra la tarjeta más cercana al botón
    if (card) {
        card.remove(); // Elimina la tarjeta del DOM
    }
}

function openSideMenu() {
    document.getElementById('side_menu').classList.add('active');
    document.getElementById('background_overlay').classList.add('active');
}

function closeSideMenu() {
    document.getElementById('side_menu').classList.remove('active');
    document.getElementById('background_overlay').classList.remove('active');
}

function logout() {
    alert("Cerrando sesión...");
    // Aquí puedes redirigir a la página de logout o hacer otras acciones
}