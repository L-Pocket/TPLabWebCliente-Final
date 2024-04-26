const divContenedor = document.querySelector("div#container")
const URL = "https://fakestoreapi.com/products"
const arrayProductos = []
const diccionarioCarrito = new Map()
const diccionarioProductos = new Map()

function cargarCarrito() {
    const carritoLS = JSON.parse(localStorage.getItem('carrito')) || [];
    
    carritoLS.forEach(e => diccionarioCarrito.set(e.id+'', e.cantidad))
    actualizarProdsEnCarrito()
}

// ---------- Template CARD Literal ${}
function crearCardHTML(producto) {
    return  `<div class="div-card">
                <div ><image class="producto-imagen" src="${producto.image}" alt="Imagen de producto"title="Imagen de producto"></image></div>
                <div class="producto-nombre"><p>${producto.title}</p></div>
                <div class="producto-importe"><p>$ ${producto.price}</p></div>
                <div class="btns-orden">
                    <div ><button id_producto=${producto.id} id="btn-agregar-${producto.id}" class="btn-agregar">AGREGAR 🛒</button></div>
                    <div ><button id="${producto.id}" class="btn-modal">Ver más</button></div>
                </div>                
            </div>`
}

function retornarError() {
    return `<h2> No se encontraron productos... </h2>`
}

// ---------- CARGAR CARDS DE PRODUCTOS

function cargarProductos(productos = arrayProductos) {
    if (productos.length > 0) {
        divContenedor.innerHTML = ""
        productos.forEach((producto) => divContenedor.innerHTML += crearCardHTML(producto))
        activarClickEnBotones()
        activarClickVerMas()
    } else {
        divContenedor.innerHTML = retornarError()
    }
}

fetch(URL)
.then((response) => response.json())
.then((data) => {
    arrayProductos.push(...data)
    data.forEach(producto => diccionarioProductos.set(producto.id+'', producto))
    cargarProductos()
    cargarCarrito()
})
.catch((error) => {
    console.error('Error al obtener los productos:', error)
})

// ---------- ALERTA CUSTOM

function abrirAlerta(mensaje = '¡Haz agregado un producto al carrito!') {
    document.getElementById('alerta').style.display = 'block'
    document.getElementById('mensaje-alerta').innerText = mensaje
    setTimeout(() => cerrarAlerta(), 1200)
}

function cerrarAlerta() {
    document.getElementById('alerta').style.display = 'none'
}

// ----------- VENTANA MODAL

const btnVerMas = document.querySelector("btn-modal")
const modal = document.querySelector("#modal-vermas")
const spanClose = document.getElementsByClassName("modal-close")[0];
const productoModal = document.querySelector('#contenedor-modal')

function abrirModal(producto) {
    const idBtn = `btn-dagregar-${producto.id}`
    modal.style.display = "block"
    //Estructura del Template literal
        productoModal.innerHTML = `<div class="div-modal">
                                        <div class="producto-nombre-modal"><p>${producto.title}</p></div>                        
                                        <div class="producto-cat"><p> Stock: ${producto.rating.count}</p></div>
                                        <div ><image class="producto-img-modal" src="${producto.image}" alt="Imagen de producto"></image></div>
                                        <div class="producto-cat"><p>${producto.category}</p></div>
                                        <div class="producto-desc"><p>${producto.description}</p></div>
                                        <div class="producto-importe-modal"><p>$ ${producto.price}</p></div>
                                        <div class="btns-orden">
                                            <div><button id_producto=${producto.id} id=${idBtn} class="btn-agregar">AGREGAR 🛒</button></div>                                        
                                        </div>                
                                 </div>`

    document.querySelector(`#${idBtn}`).addEventListener("click", () => agrergarProductoAlCarrito(producto.id))
}

function activarClickVerMas() {
    const botonesVerMas = document.querySelectorAll("button.btn-modal")
    // Abrir Modal con click
    botonesVerMas.forEach((boton)=> {
        boton.addEventListener("click", ()=> { 
            const producto = diccionarioProductos.get(boton.id)
            abrirModal(producto)      
        })
    })
    // cerrar modal con X
    spanClose.onclick = function() {
        modal.style.display = "none";
    }
    // cerrar modal haciendo click en la pantalla
    window.onclick = function(event) {
        if (event.target == modal) {
        modal.style.display = "none";
        }
    }
}

// ---------- CARRITO
const carritoContainer = document.getElementById("container-carrito")
const btnRealizarCompra = document.getElementById('realizar-compra')
const btnVaciarCarrito = document.querySelector("#vaciar-carrito")
const allCarritoContainer = document.querySelector("#container-all-carrito")

function actualizarProdsEnCarrito() {
    const spanCarrito = document.querySelector('span#spanContadorCarrito')
    spanCarrito.textContent = diccionarioCarrito.size > 0 ? Array.from(diccionarioCarrito.values()).reduce((a,b) => a+b) : 0
    
    if (diccionarioCarrito.size > 0) {
        document.querySelector('#carrito-total').innerHTML = "Total: $ "
        document.querySelector('#carrito-total').innerHTML += diccionarioCarrito.size > 0 ? Array.from(diccionarioCarrito, ([idProducto, cantidad]) => ((diccionarioProductos.get(idProducto+'').price * cantidad) || 0).toFixed(2)).reduce((a,b) => parseFloat(a) + parseFloat(b)) : 0;
    
        const btnCarrito = document.querySelector("#btn-carrito")
        btnCarrito.style.display = "block"
        btnCarrito.disabled = false
    } else {
        btnCarrito.disabled = true
        document.querySelector('#carrito-total').innerHTML = "No hay productos en el carrito"
        btnRealizarCompra.style.display = 'none'
        btnVaciarCarrito.style.display = 'none'
        setTimeout(() => {
            allCarritoContainer.style.display = 'none'
        }, 1500)
    }

    carritoContainer.innerHTML = ""
    
    Array.from(diccionarioCarrito.keys()).forEach(idProducto => carritoContainer.innerHTML += crearItemHTMLCarrito(diccionarioProductos.get(idProducto+'')))

    persistirCarrito()
}

function persistirCarrito() {
    localStorage.setItem("carrito", JSON.stringify(Array.from(diccionarioCarrito, ([idProducto, cantidad]) => ({ id: idProducto, cantidad }))))
}

const btnCarrito = document.querySelector("#btn-carrito")
const btnOcultarCarrito = document.querySelector("#ocultar-carrito");

function mostrarCarrito() {    
    const carritoContainer = document.getElementById("container-carrito")
    carritoContainer.innerHTML = ""
    
    if (diccionarioCarrito.size > 0) {
        Array.from(diccionarioCarrito.keys()).forEach(idProducto => carritoContainer.innerHTML += crearItemHTMLCarrito(diccionarioProductos.get(idProducto+'')))
    
        carritoContainer.style.display = "block"
        allCarritoContainer.style.display = "block"
        btnOcultarCarrito.style.display = "block"
        btnRealizarCompra.style.display = 'block'
        btnVaciarCarrito.style.display = 'block'
    } else {
        carritoContainer.innerHTML = "<p>No hay productos en el carrito.</p>"
        allCarritoContainer.style.display = "none"
        carritoContainer.style.display = "block"
        btnOcultarCarrito.style.display = "none"
        btnCarrito.style.display = "block"
        btnVaciarCarrito.style.display = 'none'
    }
}

function crearItemHTMLCarrito(producto) {
    return `<div class="carrito-item">
        <p>${producto.title}</p>  
        <div>                                       
            <p class="carrito-item-precio">$ ${producto.price}</p>
            <div class="controles-cantidad">
                <button class="boton-restar" id="boton-restar-${producto.id}" ${diccionarioCarrito.get(producto.id+'') == 1 ? 'disabled' : ''} onclick="modificarCantidadItem(${producto.id}, -1)">-</button>
                <span class="cantidad-productos">${diccionarioCarrito.get(producto.id+'')}</span>
                <button class="boton-sumar" onclick="modificarCantidadItem(${producto.id}, 1)">+</button>
                <button class="boton-eliminar" onclick="modificarCantidadItem(${producto.id}, -${diccionarioCarrito.get(producto.id+'')})">🗑️</button>
            </div>
        </div>
    </div>`;
}


btnCarrito.addEventListener("click", mostrarCarrito)
btnOcultarCarrito.addEventListener("click", function() {
    const carritoContainer = document.getElementById("container-carrito")
    carritoContainer.style.display = "none"
    allCarritoContainer.style.display = "none"
    btnOcultarCarrito.style.display = "none"
    btnCarrito.style.display = "block"
    btnVaciarCarrito.style.display = 'none'
})
btnVaciarCarrito.addEventListener("click", limpiarCarrito)

function activarClickEnBotones() {
    const botonesAgregar = document.querySelectorAll('button.btn-agregar')
    botonesAgregar.forEach((boton) => boton.addEventListener("click", () => agrergarProductoAlCarrito(boton.attributes.id_producto.value)))
}

function agrergarProductoAlCarrito(idProducto){
    //alert('Hiciste click en el botón. Id: '+ boton.id)
    const productoSeleccionado = diccionarioProductos.get(idProducto+'')
    //console.log(productoSeleccionado)
    const cantidad = diccionarioCarrito.get(idProducto+'') || 0
    diccionarioCarrito.set(idProducto+'', cantidad + 1)

    abrirAlerta(`¡Haz agregado correctamente tu ${productoSeleccionado.title} al carrito!`)
    //console.table(carrito)
    actualizarProdsEnCarrito()
}

function modificarCantidadItem(idProducto, extra = 1){
    const cantidad = diccionarioCarrito.get(idProducto+'') + extra

    if(cantidad <= 0){
        diccionarioCarrito.delete(idProducto+'')
    }else{
        diccionarioCarrito.set(idProducto+'', cantidad)
    }

    actualizarProdsEnCarrito()
}

// ORDEN Y FILTRO BÚSQUEDA

const filtroBusqueda = document.getElementById("filtro-input")

function filtrarProductos() {
    const valorFiltro = filtroBusqueda.value.toLowerCase()

    const resultado = arrayProductos.filter((producto) => {
        return producto.title.toLowerCase().includes(valorFiltro)
    })

    cargarProductos(resultado)
}

filtroBusqueda.addEventListener("keyup", filtrarProductos)

function productosConIVA() {
    const productosConIVA = arrayProductos.map((producto)=> {
        return {
            ...producto,
            importeFinal: producto.price * 1.21
        }
    })
    console.table(productosConIVA)
}

function ordenarProductosPorPrecio(orden) {
    let productosOrdenados

    if (orden === "ascendente") {
        productosOrdenados = arrayProductos.sort((a, b) => a.price - b.price)
    }
    if (orden === "descendente") {
        productosOrdenados = arrayProductos.sort((a, b) => b.price - a.price)
    }
    divContenedor.innerHTML = ""
    cargarProductos(productosOrdenados)
}

const btnOrdenarBaratos = document.getElementById("btn-ordenar-baratos")
const btnOrdenarCaros = document.getElementById("btn-ordenar-caros")

btnOrdenarBaratos.addEventListener("click", () => ordenarProductosPorPrecio('ascendente'))
btnOrdenarCaros.addEventListener("click", () => ordenarProductosPorPrecio('descendente'))

// Limpiar carrito y realizar compra

function limpiarCarrito() {
    diccionarioCarrito.clear()
    actualizarProdsEnCarrito()
    btnVaciarCarrito.style.display = 'none'
    carritoContainer.style.display = 'none'
    allCarritoContainer.style.display = 'none'
    abrirAlerta("¡El carrito fue vaciado con exito!")
}

function realizarCompra() {
    diccionarioCarrito.clear()
    actualizarProdsEnCarrito()
    btnVaciarCarrito.style.display = 'none'
    carritoContainer.style.display = 'none'
    allCarritoContainer.style.display = 'none'
    abrirAlerta("¡Compra realizada con exito!")
}
btnRealizarCompra.addEventListener('click', realizarCompra)

const btnInicio = document.getElementById('menu-inicio')
btnInicio.addEventListener('click', function(e) {
    e.preventDefault()
    window.location.href = ''
} )

