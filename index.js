// Carrousel

function startCarousel() {
    const carouselImages = document.querySelector('.carousel-images');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');

    let currentIndex = 0;

    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + carouselImages.children.length) % carouselImages.children.length;
        carouselImages.style.transform = `translateX(-${currentIndex * 20}%)`;
    });

    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % carouselImages.children.length;
        carouselImages.style.transform = `translateX(-${currentIndex * 20}%)`;
    });

    setInterval(() => {
        currentIndex = (currentIndex + 1) % carouselImages.children.length;
        carouselImages.style.transform = `translateX(-${currentIndex * 20}%)`;
    }, 7000);
}

startCarousel();

//CATEGORIAS

// Contenedor de productos
const categoriesContainer = document.querySelector(".categories");
const productsContainer = document.querySelector(".products-container");
const categoryButtons = document.querySelectorAll(".category");
const loadButton = document.querySelector(".btn-load");

//CART
const cartBtn = document.querySelector(".cart-label");
const cartMenu = document.querySelector(".cart");
const menuBtn = document.querySelector(".menu-label");
const barsMenu = document.querySelector(".navbar-list");
const overlay = document.querySelector(".overlay");
const productsCart = document.querySelector(".cart-container");
const total = document.querySelector(".total");
const successModal = document.querySelector(".add-modal");
const buyBtn = document.querySelector(".btn-buy");
const deleteBtn = document.querySelector(".btn-delete");
const cartBubble = document.querySelector(".cart-bubble");

//Categories

// Cantidad de productos en display
const productsPerPage = 8;
let currentPage = 0;

//función para averiguar si el índice actual renderizado de la lista de productos es igual al límite de productos
const isProductLimitLess1 = () => {
    return appState.currentProductsIndex === appState.productsLimit - 1;
}

//función para mostrar más productos ante el click del usuario en el botón "ver más"
const showMoreProductsCategories = () => {
    appState.currentProductsIndex += 1;
    let { products, currentProductsIndex } = appState;
    renderProducts(products[currentProductsIndex]);
    if (isProductLimitLess1()) {
        showMoreBtn.classList.add("hidden");
    }

};

// Filtro basado en cada categoría
function filterProducts(category) {
    if (category === "Todas") {
        return productsData;
    }
    return productsData.filter(product => product.category.toLowerCase() === category.toLowerCase());
}

// Desplegado de productos en cards
function displayProducts(products) {
    productsContainer.innerHTML = "";
    const startIndex = currentPage * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    for (let i = startIndex; i < endIndex && i < products.length; i++) {
        const product = products[i];
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
        <div class="product">
            <h3>${product.name}</h3>
            <img src="${product.cardImg}" alt="${product.name}">
            <p class="price">$${product.price.toFixed(2)}</p>
            <div class="offer-time">
            </div>
            <button class="btn-add">Agregar al carrito</button>
        </div>
        `;
        productsContainer.appendChild(productCard);
    }
}

//CATEGORIAS

// Despliegue inicial de productos
const allProducts = productsData;
displayProducts(allProducts);


//habilitar o deshabilitar un botón según corresponda
//La lógica la comparten, si el carro está vacío, los saco a ambos, si hay algo en el cart los habilito
const disableBtn = (btn) => {
    if (!cart.length) {
        btn.classList.add("disabled");
    } else {
        btn.classList.remove("disabled");
    }
};

//CART

//Función para actualizar la cantidad de productos que el usuario va guardando en el carrito
const renderCartBubble = () => {
    //acá tenemos que mostrar la suma de los quantitis, por lo tanto aplico un método que se llama reduce
    cartBubble.textContent = cart.reduce((acc, cur) => {
        return acc + cur.quantity;
    }, 0);
};

//función de actualización del carro
const updateCartState = () => {
    //guardar carrito en LS
    saveCart();
    //renderizo el carro
    renderCart();
    //mostrar el total
    showCartTotal();

    //usamos la misma fnc para ambos botones
    disableBtn(buyBtn);
    disableBtn(deleteBtn);

    renderCartBubble();

};

/**
 * Función para manejar el evento click del botón de más de cada producto del carrito.
 */
const handlePlusBtnEvent = (id) => {
    const existingCartProduct = cart.find((item) => item.id === id);
    addUnitToProduct(existingCartProduct);
};

/**
 * Función para manejar el evento click del botón de menos de cada producto del carrito.
 */
const handleMinusBtnEvent = (id) => {
    const existingCartProduct = cart.find((item) => item.id === id);

    // Si se toco en un item con uno solo de cantidad
    if (existingCartProduct.quantity === 1) {
        if (window.confirm("¿Desea eliminar el producto del carrito?")) {
            removeProductFromCart(existingCartProduct);
        }
        return; // Si no termino confirmando la eliminación, no hace nada, ya que sino la cantidad quedaría en 0, así que cortamos la ejecución.
    }
    substractProductUnit(existingCartProduct);
};

/**
 * Función para quitar una unidad de producto.
 * Se recorre el array del carrito y se busca el producto que se quiere eliminar una unidad. Si el producto pasado como parámetro es igual al producto que se está recorriendo, se le resta una unidad a la propiedad "quantity" y se actualiza el array del carrito. Si eso no ocurre, se retorna el producto que se esta recorriendo tal cual está.
 */
const substractProductUnit = (existingProduct) => {
    cart = cart.map((product) => {
        return product.id === existingProduct.id ? {...product, quantity: Number(product.quantity) - 1 } :
            product;
    });
};

/**
 * Función para eliminar un producto del carrito.
 */
const removeProductFromCart = (existingProduct) => {
    cart = cart.filter((product) => product.id !== existingProduct.id);
    updateCartState();
};

/**
 * Función que maneja los eventos de apretar el botón de más o de menos según corresponda.
 */
const handleQuantity = (e) => {
    if (e.target.classList.contains("down")) {
        handleMinusBtnEvent(e.target.dataset.id);
    } else if (e.target.classList.contains("up")) {
        handlePlusBtnEvent(e.target.dataset.id);
    }
    //Para todos los casos
    updateCartState();
};


/**
 * Función para vaciar el carrito.
 */
const resetCartItems = () => {
    cart = [];
    updateCartState();
};

/**
 * Función para completar la compra o vaciar el carrito.
 */
const completeCartAction = (confirmMsg, successMsg) => {
    if (!cart.length) return; //Si el carrito está vacío, no hace nada.
    if (window.confirm(confirmMsg)) {
        resetCartItems();
        alert(successMsg);
    }
};

/**
 * Función para disparar el mensaje de compra exitosa y su posterior mensaje de exito en caso de darse la confirmación.
 */
const completeBuy = () => {
    completeCartAction("¿Desea completar su compra?", "¡Gracias por su compra!");
};


/**
 * Función para disparar el mensaje de vaciado de carrito y su posterior mensaje de exito en caso de darse la confirmación.
 */
const deleteCart = () => {
    completeCartAction(
        "¿Desea vaciar el carrito?",
        "No hay productos en el carrito"
    );
};


//esta función tiene que hacer un par de cosas
//togglea el cart y si el menú está abierto, lo cierra. Finalmente, muestra el overlay si no había nada abierto y se está abriendo el carrito.
const toggleCart = () => {
    //aca le digo a cartMenu que cada vez que el user haga click, va a tener la clase open-cart 
    cartMenu.classList.toggle("open-cart");

    //chequear si el menu hamburguesa esta abierto, lo cierro y retorno
    if (barsMenu.classList.contains("open-menu")) {
        barsMenu.classList.remove("open-menu");
        return; //si ya habia algo abierto, no se togglea el overlay
    }
    //si está cerrado, entro a la clase y la cambiamos con un toggle
    overlay.classList.toggle("show-overlay");

};

//función para mostrar u ocultar el menú hamburguesa y el overlay, según corresponda
const toggleMenu = () => {
    barsMenu.classList.toggle("open-menu");
    if (cartMenu.classList.contains("open-cart")) {
        cartMenu.classList.remove("open-cart");
        return; //si ya había algo abierto, no se togglea el overlay, por eso el return
    }
    overlay.classList.toggle("show-overlay");
};

//hacemos una función para cerrar el menú hamburguesa o el carrito y ocultar el overlay cuando el usuario scrolee
const closeOnScroll = () => {
    if (!barsMenu.classList.contains("open-menu") &&
        !cartMenu.classList.contains("open-cart")
    ) {
        return
    };
    barsMenu.classList.remove("open-menu");
    cartMenu.classList.remove("open-cart");
    overlay.classList.remove("show-overlay");
};

//función para cerrar el menú hamburguesa y el overlay cuando se hace click en un link
const closeOnClick = (e) => {
    //chequeo que sea un click en el link
    if (!e.target.classList.contains("navbar-link")) {
        return
    };
    //si estoy efectivamente haciendo click en una etiqueta a
    barsMenu.classList.remove("open-menu");
    overlay.classList.remove("show-overlay");
};

//función para cerrar el menú hamburguesa o el carrito y ocultar el overlay cuando el usuario hace clik en el overlay
const closeOnOverlayClick = () => {
    barsMenu.classList.remove("open-menu");
    cartMenu.classList.remove("open-cart");
    overlay.classList.remove("show-overlay");
}


//RENDERIZAR EL CARRITO
//nuestro carrito será un arreglo de objetitos y vamos a aplicarle una lógica parecida al todoList

//setear el carrito vacío o lo que esté en LS
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const saveCart = () => {
    localStorage.setItem("cart", JSON.stringify(cart));
};

//ya tenemos el carrito guardado, ahora hay que armar la lógica del renderizado 
// hacer una función para renderizar los productos del carrito o enviar el msg "no hay productos"
const renderCart = () => {
    //capturo el lugar adonde quiero mostrar el carrito
    if (!cart.length) {
        productsCart.innerHTML = `
        <p class="empty-msg">No hay productos en el carrito</p>
        `;
        return;
    }
    productsCart.innerHTML = cart.map(createCartProductTemplate).join("");
};

//función para mostrar el total de la compra
const showCartTotal = () => {
    //acá voy a necesitar una función auxiliar que me traiga el total del carrito
    total.innerHTML = `${getCartTotal().toFixed(2)} ARS`;
};

//función para obtener el total de la compra
const getCartTotal = () => {
    return cart.reduce((acc, cur) => acc + Number(cur.bid) * cur.quantity, 0)
};

//ahora pasamos a la lógica para agregar al carrito
//Función para crear un objeto con la info del producto que quiero agregar al carrito o bien agregar una unidad de un producto ya incorporado en mi carrito
const addProduct = (e) => {
    //primero mi función recibe el evento y después tengo que saber si el click proviene del botón del producto
    if (!e.target.classList.contains("btn-add")) { return };
    //ahora vamos a la otra lógica y acá me voy a guardar el dataset del producto que estoy agregando para luego revisar si existe o no en el carrito (para saber si agrego la card o la cantidad de ese producto)

    //llamo a la función para desestructurar lo que necesito utilizar 
    const product = createProductData(e.target.dataset);
    //comprobar si el producto ya está en el carro
    if (isExistingCartProduct(product)) {
        addUnitToProduct(product);
        //mostrar un feedback
        showSuccessModal("Se agregó un producto al carrito");
    } else {
        //creamos el producto en el carrito y dar feedback al usuario
        createCartProduct(product);
        showSuccessModal("El producto se ha agregado al carrito")
    };

    updateCartState();

};

// función desestructuradora
const createProductData = (product) => {
    const { id, name, price, img } = product;
    return { id, name, price, img };
};


//función que comprueba si el producto ya fue agregado al carrito
const isExistingCartProduct = (product) => {
    return cart.find((item) => item.id === product.id);
};

//función para agregar una unidad al producto que ya tengo en el cart
const addUnitToProduct = (product) => {
    cart = cart.map((cartProduct) =>
        cartProduct.id === product.id ? {...cartProduct, quantity: cartProduct.quantity + 1 } :
        cartProduct
    );
};

//función para darle una devolución al usuario
const showSuccessModal = (msg) => {
    successModal.classList.add("active-modal");
    successModal.textContent = msg;
    setTimeout(() => {
        successModal.classList.remove("active-modal")
    }, 1500);
};

//creamos un objeot con la info del producto que queremos agregar
const createCartProduct = (product) => {
    cart = [...cart, {...product, quantity: 1 }];
};

//CATEGORIAS

// función inicializadora para categorías
categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        categoryButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        const selectedCategory = button.dataset.category;
        const filteredProducts = filterProducts(selectedCategory);
        currentPage = 0;
        displayProducts(filteredProducts);
    });
});

loadButton.addEventListener("click", () => {
    const selectedCategory = document.querySelector(".category.active").dataset.category;
    const filteredProducts = filterProducts(selectedCategory);
    currentPage++;
    displayProducts(filteredProducts);
    if (currentPage * productsPerPage >= filteredProducts.length) {
        loadButton.style.display = "none";
    }
});

//CART and categories

// Otras funciones iniciadoreas o para cart menu

const init = () => {
    showMoreBtn.addEventListener("click", showMoreProductsCategories);
    cartBtn.addEventListener("click", toggleCart);
    menuBtn.addEventListener("click", toggleMenu);
    window.addEventListener("scroll", closeOnScroll);
    barsMenu.addEventListener("click", closeOnClick);
    overlay.addEventListener("click", closeOnOverlayClick);
    document.addEventListener("DOMContentLoaded", renderCart);
    document.addEventListener("DOMContentLoaded", showCartTotal);
    productsContainer.addEventListener("click", addProduct);
    productsCart.addEventListener("click", handleQuantity);
    buyBtn.addEventListener("click", completeBuy);
    deleteBtn.addEventListener("click", deleteCart);
    disableBtn(buyBtn);
    disableBtn(deleteBtn);
    renderCartBubble(cart);
};
init();