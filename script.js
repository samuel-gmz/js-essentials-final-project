// Imports y obtención de elementos HTML 
import { objProductos } from './objProductos.js' 
const btnVerProductos = document.getElementById('btn-ver-productos') 
const containerProductos = document.getElementById('container-productos') 
const paginationBtns = document.getElementById('pagination') 
const btnAnterior = document.getElementById('btnAnterior') 
const btnSiguiente = document.getElementById('btnSiguiente') 
const carritoIcon = document.getElementById('img-carrito')
const containerCarrito = document.getElementById('container-carrito')
const btnAgregarCarrito = document.getElementsByClassName('btn-agregar-carrito')
// Fin imports y obtención de elementos HTML


// Botón página inicial
btnVerProductos.addEventListener('click', () => {
    containerProductos.style.display = 'grid' // Ver container productos
    paginationBtns.style.display = 'flex' // Ver botones paginación
    btnVerProductos.style.display = 'none' // Dejar de ver botón página inicial
    carritoIcon.style.display = 'flex'
    containerCarrito.style.display = 'none'
    showProducts(state)
})
// Fin botón página inicial



// Bloque que maneja el paginado
let offsetLet = 0
let c = 0 
// en 0 representa que estamos en la página de objProductos
// en 1 que le dimos a siguiente por primera vez
// cuando se retorna a la página objProductos se setea en 0 denuevo
btnSiguiente.addEventListener('click', () => {
    if (offsetLet == 0 && c == 0) {
        getProducts()
        c = 1
    } else {
        offsetLet += 8
        getProducts()
    }
})
btnAnterior.addEventListener('click', () => {
    if (offsetLet >= 8) {
        offsetLet -= 8
        getProducts()
    } else {
        c = 0
        showProducts()
    }
})
// Fin bloque que maneja paginado



// Bloque dedicado a dibujar productos de la API
// Obtención respuesta de API y llamado a función para dibujarla
const getProducts = async () => {
    const respuesta = await axios.get('https://api.mercadolibre.com/sites/MLC/search?q=videogames', {
        params: {
            limit: 8,
            offset: offsetLet
        }
    })
    dibujar(respuesta)
}   
// Fin obtención respuesta API y llamado a función para dibujarla


// Función para dibujar en index.html la respuesta de la API
const dibujar = (respuesta) => {
    let products = ''
    items = []
    respuesta.data.results.forEach(product => {
        let obj =  {
            title: product.title,
            price: product.price,
            img: `http://http2.mlstatic.com/D_${product.thumbnail_id}-I.jpg`
        }
        products += `<div class="product">
        <img class="thumbnail" src="http://http2.mlstatic.com/D_${product.thumbnail_id}-I.jpg">
        <h3 class="title">${product.title}</h3>
        <h3 class="title">Precio: ${product.price}</h3>
        <button class="btn-agregar-carrito">Agregar a Carrito</button>
        </div>`
        items.push(obj)
    })
    containerProductos.innerHTML = products
    addCart()
}
// Fin función para dibujar en index.html la respuesta de la API
// Fin bloque dedicado a dibujar productos de la API



// Bloque que simula una promesa para dibujar los productos de objProductos
const isOK = true
const customFetch = (time, task) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if(isOK) {
                resolve(task)
            } else {
                reject("Error")
            }
        })
    }, time)
}
let items = [] // voy guardando datos de cada item dibujado, para poder guardarlos o borrarlos del estado
const showProducts = (state) => {
    let arrayProductos = customFetch(2000, objProductos).then(
        data => {
            let products = ''
            items = [] // Debe ser reseteado por cada "página" cargada
            for(let i=0; i<data.length; i++) {
                // objeto con datos del producto para ser guardado en lista items que luego se ingresa al estado
                let obj =  {
                    title: data[i].title,
                    price: data[i].precio,
                    img: data[i].thumbnail
                }
                products += `<div class="product">
                <img class="thumbnail" src="${data[i].thumbnail}">
                <h3 class="title">${data[i].title}</h3>
                <h3 class="title">Precio: ${data[i].precio}</h3>
                <button class="btn-agregar-carrito">Agregar a Carrito</button>
                </div>`
                items.push(obj)
            } 
            containerProductos.innerHTML = products
            addCart()  
        }
    )
}
// Función agregado carrito
const addCart = () => {
    for (let i = 0; i < btnAgregarCarrito.length; i++) {
        btnAgregarCarrito[i].addEventListener('click', () =>{
            const lastState = getState()
            lastState.carritoCompras.push(items[i]) 
            setState(lastState)
        });
    }
}
// Fin bloque que simula una promesa para dibujar los productos de objProductos



// Manejo de estados
// ORIGINAL
const state = {
    carritoCompras: []
}
// COPIA
const getState = () => JSON.parse(JSON.stringify(state))
const template = () => {
    if (state.carritoCompras.length < 1) { 
        return `<p>Carrito de compras vacío</p>`
    }
    let itemsCarro = state.carritoCompras.map((item, index) => `<div class="product">
    <img class="thumbnail" src="${item.img}">
    <h3 class="title">${item.title}</h3>
    <h3 class="title">Precio: ${item.price}</h3>
    <button class="btn-borrar-carrito">Eliminar</button> 
    </div>`).join("")
    return itemsCarro
} 
// Dibuja en container carrito
const render = () => {
    containerCarrito.innerHTML = template() 
}
const setState = (obj) => { 
    for (let key in obj) { 
        if (state.hasOwnProperty(key)) { 
            state[key] = obj[key]
        }
    }
}
// Fin manejo estados



// Botón para entrar al carrito de compras, esconde y muestra elementos HTML correspondientes
carritoIcon.addEventListener('click', () => {
    containerCarrito.style.display = 'grid'
    paginationBtns.style.display = 'none' 
    btnVerProductos.style.display = 'flex'
    containerProductos.style.display = 'none'
    carritoIcon.style.display = 'none'
    // Primer llamado a render del ciclo al darle click al icono del carrito, render llama a template que toma cada elemento del estado y devuelve elementos HTML
    render() 
    const btnsDelFromCart = document.getElementsByClassName('btn-borrar-carrito')
    // Función que agrega el funcionamiento de los botones eliminar del carrito, el botón eliminar crea una copia del estado, lo filtra y actualiza estado
    // original con lo filtrado, al click en botón eliminar le añade un llamado a render que necesita que luego la función se llame a si misma al final para funcionar
    const delFromCart = () => {
        for (let i = 0; i < btnsDelFromCart.length; i++) {
            btnsDelFromCart[i].addEventListener('click', () =>{
                const lastState = getState() 
                let newState = lastState.carritoCompras.filter((elem, index) => index != i)
                setState({carritoCompras: newState})
                render()
                delFromCart()
            });
        }
    }
    delFromCart() // tengo que llamarla acá obviamente
})