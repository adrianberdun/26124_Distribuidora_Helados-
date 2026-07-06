document.addEventListener("DOMContentLoaded", () => {
    
    const API_URL = "https://66fc68e1c3a184a84d175402.mockapi.io/api/v1/helados"; 
    
    let listadoProductos = [];
    let carrito = JSON.parse(localStorage.getItem("carrito_alan_helados")) || [];

    const productosContainer = document.getElementById("productosContainer");

    async function obtenerProductosAPI() {
        try {
            const respuesta = await fetch(API_URL);
            if (!respuesta.ok) {
                throw new Error("No se pudo conectar con la base de datos.");
            }
            listadoProductos = await respuesta.json();
            renderizarProductos(listadoProductos);
        }         catch (error) {
            console.error("Error Fetch:", error);
            listadoProductos = [
                { 
                    id: "1", 
                    nombre: "Bombon Palito ", 
                    precio: 500, 
                    imagen:"imagenes/palitobombon.jpg", 
                    descripcion: "Palitos de agua y crema súper económicos. La opción más accesible e ideal para tu negocio." 
                },
                { 
                    id: "2", 
                    nombre: "Alfajor Helado", 
                    precio: 2500, 
                    imagen:"imagenes/alfajorhelado.jpg", 
                    descripcion: "La cobinacion perfecta, Exquisito Alfajor Helado de nivel premium." 
                },
                { 
                    id: "3", 
                    nombre: "Cremas y Baldes 10L", 
                    precio: 35400, 
                    imagen:"imagenes/balde.jpg", 
                    descripcion: "Gran variedad de sabores y combinaciones clásicas e innovadoras listas para despachar."
                }
            ];
            renderizarProductos(listadoProductos);
        }
    }

    function renderizarProductos(productos) {
        if (!productosContainer) return;
        productosContainer.innerHTML = "";
        
        productos.forEach(prod => {
            const article = document.createElement("article");
            article.classList.add("productCard");
            
            article.innerHTML = `
                <img src="${prod.imagen}" alt="Presentación de ${prod.nombre}" class="productCardImage">
                <h4 class="productCardTitle">${prod.nombre}</h4>
                <p class="productCardDescription">${prod.descripcion || 'Línea distribuidora directa de fábrica.'}</p>
                <span class="productCardPrice">$${prod.precio.toLocaleString('es-AR')}</span>
                <button class="productCardButton btnAddToCart" data-id="${prod.id}">Añadir al Carrito</button>
            `;
            productosContainer.appendChild(article);
        });

        const btnAddList = document.querySelectorAll(".btnAddToCart");
        btnAddList.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idSeleccionado = e.target.getAttribute("data-id");
                agregarProductoAlCarrito(idSeleccionado);
            });
        });
    }

    const cartCounter = document.getElementById("cartCounter");
    const cartModal = document.getElementById("cartModal");
    const cartToggleBtn = document.getElementById("cartToggleBtn");
    const cartCloseBtn = document.getElementById("cartCloseBtn");
    const cartItemsContainer = document.getElementById("cartItemsContainer");
    const cartTotalAmount = document.getElementById("cartTotalAmount");
    const checkoutBtn = document.getElementById("checkoutBtn");

    function agregarProductoAlCarrito(id) {
        const itemEncontrado = listadoProductos.find(p => p.id === id);
        if (!itemEncontrado) return;

        const yaExiste = carrito.find(item => item.id === id);

        if (yaExiste) {
            yaExiste.cantidad += 1;
        } else {
            carrito.push({
                id: itemEncontrado.id,
                nombre: itemEncontrado.nombre,
                precio: itemEncontrado.precio,
                imagen: itemEncontrado.imagen,
                cantidad: 1
            });
        }

        notificarUsuario(`¡${itemEncontrado.nombre} agregado!`);
        actualizarEstadoGlobalCarrito();
    }

    function actualizarEstadoGlobalCarrito() {
        localStorage.setItem("carrito_alan_helados", JSON.stringify(carrito));
        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        if (cartCounter) cartCounter.textContent = totalItems;
        renderizarItemsCarrito();
    }

    function renderizarItemsCarrito() {
        if (!cartItemsContainer) return;
        
        if (carrito.length === 0) {
            cartItemsContainer.innerHTML = `<p class="emptyCartText">El carrito está vacío.</p>`;
            if (cartTotalAmount) cartTotalAmount.textContent = "$0.00";
            return;
        }

        cartItemsContainer.innerHTML = "";
        let sumaTotal = 0;

        carrito.forEach(item => {
            const itemTotal = item.precio * item.cantidad;
            sumaTotal += itemTotal;

            const div = document.createElement("div");
            div.classList.add("cartItemRow");
            div.innerHTML = `
                <img src="${item.imagen}" alt="${item.nombre}" class="cartItemImage">
                <div class="cartItemInfo">
                    <h5>${item.nombre}</h5>
                    <p>$${item.precio.toLocaleString('es-AR')} c/u</p>
                </div>
                <div class="cartItemActions">
                    <button class="btnQty decBtn" data-id="${item.id}">-</button>
                    <span class="cartItemQty">${item.cantidad}</span>
                    <button class="btnQty incBtn" data-id="${item.id}">+</button>
                    <button class="btnDeleteItem" data-id="${item.id}">&times;</button>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });

        if (cartTotalAmount) cartTotalAmount.textContent = `$${sumaTotal.toLocaleString('es-AR')}`;
        asignarEventosAccionesCarrito();
    }

    function asignarEventosAccionesCarrito() {
        document.querySelectorAll(".incBtn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.target.getAttribute("data-id");
                const prod = carrito.find(item => item.id === id);
                if (prod) prod.cantidad += 1;
                actualizarEstadoGlobalCarrito();
            });
        });

        document.querySelectorAll(".decBtn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.target.getAttribute("data-id");
                const prod = carrito.find(item => item.id === id);
                if (prod) {
                    prod.cantidad -= 1;
                    if (prod.cantidad <= 0) {
                        carrito = carrito.filter(item => item.id !== id);
                    }
                }
                actualizarEstadoGlobalCarrito();
            });
        });

        document.querySelectorAll(".btnDeleteItem").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.target.getAttribute("data-id");
                carrito = carrito.filter(item => item.id !== id);
                actualizarEstadoGlobalCarrito();
            });
        });
    }

    if (cartToggleBtn) cartToggleBtn.addEventListener("click", () => cartModal.classList.add("active"));
    if (cartCloseBtn) cartCloseBtn.addEventListener("click", () => cartModal.classList.remove("active"));
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            if (carrito.length === 0) {
                alert("No hay productos en el carrito.");
                return;
            }
            alert("¡Pedido Simulado con Éxito!");
            carrito = [];
            actualizarEstadoGlobalCarrito();
            cartModal.classList.remove("active");
        });
    }

    const contactoForm = document.getElementById("contactoForm");
    if (contactoForm) {
        contactoForm.addEventListener("submit", (e) => {
            let contieneErrores = false;
            
            const inputNombre = document.getElementById("nombre");
            const inputEmail = document.getElementById("email");
            const inputMensaje = document.getElementById("mensaje");

            const errorNombre = document.getElementById("errorNombre");
            const errorEmail = document.getElementById("errorEmail");
            const errorMensaje = document.getElementById("errorMensaje");

            if (errorNombre) errorNombre.textContent = "";
            if (errorEmail) errorEmail.textContent = "";
            if (errorMensaje) errorMensaje.textContent = "";

            if (inputNombre && inputNombre.value.trim() === "") {
                if (errorNombre) errorNombre.textContent = "El nombre completo es obligatorio.";
                contieneErrores = true;
            }

            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (inputEmail && inputEmail.value.trim() === "") {
                if (errorEmail) errorEmail.textContent = "El correo electrónico es obligatorio.";
                contieneErrores = true;
            } else if (inputEmail && !regexEmail.test(inputEmail.value.trim())) {
                if (errorEmail) errorEmail.textContent = "Por favor, introduce un email válido.";
                contieneErrores = true;
            }

            if (inputMensaje && inputMensaje.value.trim() === "") {
                if (errorMensaje) errorMensaje.textContent = "La consulta no puede estar vacía.";
                contieneErrores = true;
            }

            if (contieneErrores) {
                e.preventDefault();
            }
        });
    }

    function notificarUsuario(mensaje) {
        const aviso = document.createElement("div");
        aviso.classList.add("toastNotification");
        aviso.textContent = mensaje;
        document.body.appendChild(aviso);
        setTimeout(() => { aviso.remove(); }, 2500);
    }

    obtenerProductosAPI();
    actualizarEstadoGlobalCarrito();
});
