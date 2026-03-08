let carrito = [];
let contadorVisual = document.getElementById("contador-carrito");

// 1. LÓGICA DEL MENÚ ACORDEÓN (Cierra los demás al abrir uno nuevo)
let botonesCategoria = document.getElementsByClassName("btn-categoria");

for (let i = 0; i < botonesCategoria.length; i++) {
    botonesCategoria[i].addEventListener("click", function() {
        let panelActual = this.nextElementSibling;
        let estaAbierto = panelActual.style.display === "block";

        // Primero: Cerramos todos los paneles que estén abiertos
        let todosLosPaneles = document.getElementsByClassName("panel-categoria");
        for (let j = 0; j < todosLosPaneles.length; j++) {
            todosLosPaneles[j].style.display = "none";
        }

        // Segundo: Si el que clickeamos estaba cerrado, lo abrimos
        // Si ya estaba abierto, se queda cerrado (porque ya lo cerramos arriba)
        if (!estaAbierto) {
            panelActual.style.display = "block";
        }
    });
}
// 2. LÓGICA PARA AGREGAR PRODUCTOS
function agregarItem(boton, nombreProducto, precioFijo) {
    let contenedor = boton.closest('.opciones');
    let selectores = contenedor.querySelectorAll('.opcion-detalle');
    let checkboxes = contenedor.querySelectorAll('.opcion-check');
    let cantidadInput = contenedor.querySelector('.cantidad-producto');
    let cantidad = parseInt(cantidadInput.value);

    let precioUnitario = precioFijo;
    let detalles = [];

    selectores.forEach(select => {
        let opcionElegida = select.options[select.selectedIndex];
        let etiqueta = select.previousElementSibling.innerText.replace(':', '');
        let valor = opcionElegida.text;
        
        detalles.push(`${etiqueta}: ${valor}`);

        if (precioFijo === 0 && opcionElegida.getAttribute('data-precio')) {
            precioUnitario = parseInt(opcionElegida.getAttribute('data-precio'));
        }
    });

    let ingredientesMarcados = [];
    checkboxes.forEach(cb => {
        if (cb.checked) {
            ingredientesMarcados.push(cb.value);
        }
    });
    
    if (checkboxes.length > 0) {
        if (ingredientesMarcados.length > 0) {
            detalles.push(`Incluye: ${ingredientesMarcados.join(', ')}`);
        } else {
            detalles.push(`Incluye: NADA (Sin extras/preparación)`);
        }
    }

    let subtotal = precioUnitario * cantidad;

    let item = {
        nombre: nombreProducto,
        cantidad: cantidad,
        precioTotal: subtotal,
        detalles: detalles
    };

    carrito.push(item);
    actualizarContadorCarrito();
    cantidadInput.value = 1;
    mostrarNotificacion();
}

function mostrarNotificacion() {
    let toast = document.getElementById("toast-notificacion");
    toast.className = "toast mostrar";
    setTimeout(function() {
        toast.className = toast.className.replace("toast mostrar", "toast");
    }, 3000);
}

function actualizarContadorCarrito() {
    let totalItems = 0;
    carrito.forEach(item => {
        totalItems += item.cantidad;
    });
    contadorVisual.innerText = totalItems;
}

// 3. LÓGICA DE LA VENTANA DEL CARRITO (MODAL)
let modal = document.getElementById("modal-carrito");
let btnAbrirCarrito = document.getElementById("abrir-carrito");
let btnCerrarCarrito = document.getElementById("cerrar-carrito");
let btnRegresar = document.getElementById("btn-regresar-menu");

// Hacemos que los botones funcionen SOLO si existen en tu HTML
if (btnRegresar) {
    btnRegresar.onclick = function() {
        modal.style.display = "none";
    }
}

if (btnAbrirCarrito) {
    btnAbrirCarrito.onclick = function() {
        modal.style.display = "block";
        actualizarVistaCarrito();
    }
}

if (btnCerrarCarrito) {
    btnCerrarCarrito.onclick = function() {
        modal.style.display = "none";
    }
}

// Cierra la ventana si tocan fuera de ella
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
function actualizarVistaCarrito() {
    let lista = document.getElementById('lista-carrito');
    let totalSpan = document.getElementById('total-pedido');
    
    lista.innerHTML = '';
    let total = 0;
    let cantidadBolis = 0; // <-- NUEVO: Variable para contar los bolis

    if (carrito.length === 0) {
        lista.innerHTML = '<p style="text-align:center;">Aún no has agregado productos.</p>';
        totalSpan.innerText = "0";
        return;
    }

    carrito.forEach((item, index) => {
        total += item.precioTotal;
        
        // <-- NUEVO: Identificamos si es boli y lo sumamos
        if (item.nombre === 'Bolis') {
            cantidadBolis += item.cantidad;
        }

        let div = document.createElement('div');
        div.className = 'item-carrito';
        div.innerHTML = `
            <div>
                <strong>${item.cantidad}x ${item.nombre}</strong> ($${item.precioTotal})<br>
                <small style="display:block; margin-top:5px;">${item.detalles.join(' | ')}</small>
            </div>
            <button type="button" class="btn-eliminar" onclick="eliminarItem(${index})">X</button>
        `;
        lista.appendChild(div);
    });

    // <-- NUEVO: Aplicamos la promoción de 2 Bolis por $15 (Descuento de $5 por par)
    if (cantidadBolis >= 2) {
        let paresBolis = Math.floor(cantidadBolis / 2);
        let descuento = paresBolis * 5; 
        total -= descuento;
        
        // Agregamos un texto visual para que el cliente sepa que ahorró
        let divPromo = document.createElement('div');
        divPromo.innerHTML = `<strong style="color: #28a745; text-align: center; display: block; margin-top: 10px;">¡Promo Bolis aplicada: -$${descuento}!</strong>`;
        lista.appendChild(divPromo);
    }

    totalSpan.innerText = total;
}
function eliminarItem(index) {
    carrito.splice(index, 1);
    actualizarVistaCarrito();
    actualizarContadorCarrito();
}

// 4. LÓGICA FINAL DE WHATSAPP
function enviarPedido() {
    let telefono = "525656959816"; 
    
    if (carrito.length === 0) {
        alert("Tu carrito está vacío. Añade productos al pedido primero.");
        return;
    }

    let mensaje = `Hola, quiero hacer el siguiente pedido:\n\n`;
    let totalPagar = 0;
    let cantidadBolis = 0; // <-- NUEVO: Contador para WhatsApp

    carrito.forEach(item => {
        totalPagar += item.precioTotal;
        
        // <-- NUEVO
        if (item.nombre === 'Bolis') {
            cantidadBolis += item.cantidad;
        }
        
        let textoCantidad = item.cantidad > 1 ? `${item.cantidad}x ` : '';
        mensaje += `  • ${textoCantidad}${item.nombre} - $${item.precioTotal}\n`;
        
        item.detalles.forEach(detalle => {
            mensaje += `  - ${detalle}\n`;
        });
        
        mensaje += `\n`; 
    });

    // <-- NUEVO: Restamos el descuento y te avisamos en WhatsApp
    if (cantidadBolis >= 2) {
        let paresBolis = Math.floor(cantidadBolis / 2);
        let descuento = paresBolis * 5;
        totalPagar -= descuento;
        
        mensaje += `🎁 *Promo Bolis Aplicada: -$${descuento}*\n\n`;
    }

// --- CÓDIGO DE NOTAS ---
    let cajaNotas = document.getElementById('notas-pedido');
    if (cajaNotas && cajaNotas.value.trim() !== "") {
        mensaje += `📝 *Instrucciones especiales:*\n${cajaNotas.value.trim()}\n\n`;
    }
    // -----------------------

    mensaje += `*Total: $${totalPagar}*`;

    let url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}
function actualizarSaboresDorilocos() {
    let tamano = document.getElementById("select-tamano-dorilocos").value;
    let selectSabor = document.getElementById("select-sabor-dorilocos");
    
    // Limpiamos las opciones actuales
    selectSabor.innerHTML = "";

    let sabores = [];
    if (tamano === "Chico") {
        sabores = ["Doritos Nacho", "Sabritas", "Ruffles", "Rancheritos"];
    } else {
        sabores = ["Doritos Nacho", "Chips Moradas", "Cheetos Flamin Hot", "Takis Fuego"];
    }

    // Agregamos los nuevos sabores al menú desplegable
    sabores.forEach(sabor => {
        let opt = document.createElement("option");
        opt.value = sabor;
        opt.innerHTML = sabor;
        selectSabor.appendChild(opt);
    });
}

// Llamamos a la función al inicio para que llene los sabores por defecto
actualizarSaboresDorilocos();