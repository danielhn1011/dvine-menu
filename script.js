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
// Agregamos esto a tu lógica de Modal
let btnRegresar = document.getElementById("btn-regresar-menu");

btnRegresar.onclick = function() {
    modal.style.display = "none";
}
btnAbrirCarrito.onclick = function() {
    modal.style.display = "block";
    actualizarVistaCarrito();
}

btnCerrarCarrito.onclick = function() {
    modal.style.display = "none";
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

    if (carrito.length === 0) {
        lista.innerHTML = '<p style="text-align:center;">Aún no has agregado productos.</p>';
        totalSpan.innerText = "0";
        return;
    }

    carrito.forEach((item, index) => {
        total += item.precioTotal;
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

    carrito.forEach(item => {
        totalPagar += item.precioTotal;
        
        // Si pide más de uno, le agregamos el número (ej. 2x Dorilocos), si no, lo dejamos normal
        let textoCantidad = item.cantidad > 1 ? `${item.cantidad}x ` : '';
        
        // Formato principal: • Dorilocos - $30
        mensaje += `  • ${textoCantidad}${item.nombre} - $${item.precioTotal}\n`;
        
        // Formato de los detalles: - Base: Doritos
        item.detalles.forEach(detalle => {
            mensaje += `  - ${detalle}\n`;
        });
        
        mensaje += `\n`; // Dejamos un espacio en blanco entre cada producto
    });

    mensaje += `Total: $${totalPagar}`;

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

// Llamamos a la función una vez al cargar la página para que el "Chico" ya tenga sus sabores puestos
actualizarSaboresDorilocos();