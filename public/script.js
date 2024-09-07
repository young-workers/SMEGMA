
/*---------------- PRODUCT SLIDER FUNCTION ----------------*/

let prevBtn = document.getElementById('prev');
let nextBtn = document.getElementById('next');
let carousel = document.querySelector('.carousel');
let items = carousel.querySelectorAll('.list .item');
let indicator = carousel.querySelector('.indicators');
let dots = indicator.querySelectorAll('.indicators ul li');

let active = 0;
let firstPosition = 0;
let lastPosition = items.length - 1;
let autoPlay;

const startAutoPlay = () => {
    clearInterval(autoPlay); 
    autoPlay = setInterval(() => {
        nextBtn.click();
    }, 10000);
}
startAutoPlay();

const setSlider = () => {
    let itemActiveOld = carousel.querySelector('.list .item.active');
    if(itemActiveOld) itemActiveOld.classList.remove('active');
    items[active].classList.add('active');

    let dotActiveOld = indicator.querySelector('.indicators ul li.active');
    if(dotActiveOld) dotActiveOld.classList.remove('active');
    dots[active].classList.add('active');

    indicator.querySelector('.number').innerText = '0' + (active + 1);
    startAutoPlay();
}
setSlider();

nextBtn.onclick = () => {
    active = active + 1 > lastPosition ? 0 : active + 1;
    carousel.style.setProperty('--calculation', 1);
    setSlider();
}
prev.onclick = () => {
    active = active - 1 < firstPosition ? lastPosition : active - 1;
    carousel.style.setProperty('--calculation', -1);
    setSlider();
    clearInterval(autoPlay);
    autoPlay = setInterval(() => {
        nextBtn.click();
    }, 5000);
}
dots.forEach((item, position) => {
    item.onclick = () => {
        active = position;
        setSlider();
    }
})

/*---------------- MOBILE MENU ----------------*/

const menu = document.querySelector('#mobile-menu');
const nav = document.getElementById('mobile-nav');

menu.addEventListener('click', function() {
    menu.classList.toggle('is-active');
    nav.classList.toggle('is-active');
});

/*---------------- CART TAB MOVEMENT ----------------*/

const cartOpenBtn = document.querySelector('#mobile-cart');
const cartTab = document.querySelector('.cart-tab');
const cartCloseBtn = document.querySelector('.close-tab')

// handles opening and closing the cart tab
cartOpenBtn.addEventListener('click', function() {
    cartTab.classList.toggle('is-active');
});
cartCloseBtn.addEventListener('click', function() {
    cartTab.classList.remove('is-active');
});

/*---------------- ADDING TO CART ----------------*/

// Select the parent container that contains all products
let listProductHTML = document.querySelector('.list')
// Array to hold added products
let listProducts = [];
// Array to hold products
let carts = [];
let listCartHTML = document.querySelector('.list-cart');
let iconCartSpan = document.querySelector('.cart-number');

listProductHTML.addEventListener('click', (event) => {
    // Get the element that was clicked
    let positionClick = event.target;
    // Check if the clicked element has the 'add-to-cart' class
    if(positionClick.classList.contains('add-to-cart')){
        // Navigate up the DOM to find the closest parent '.item' element and get its data-id attribute
        let product_id = positionClick.closest('.item').dataset.id;
        addToCart(product_id);
    }
});

const addToCart = (product_id) => {
    let positionThisProductInCart = carts.findIndex((value) => value.product_id == product_id);
    if(carts.length <= 0){
        carts = [{
            product_id: product_id,
            quantity: 1
        }];
    } else if(positionThisProductInCart < 0) {
        carts.push({
            product_id: product_id,
            quantity: 1
        });
    } else {
        carts[positionThisProductInCart].quantity++;
    }
    addCartToHTML();
    addCartToMemory();
}

const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(carts));
}

const updateTotalCostHTML = (totalCost) => {
    let totalCostElement = document.querySelector('.total-cost');

    // Check if the total cost element already exists
    if (!totalCostElement) {
        // Create the total cost element
        totalCostElement = document.createElement('div');
        totalCostElement.classList.add('total-cost');
        totalCostElement.innerHTML = `Total: $<span id="total-price">${totalCost.toFixed(2)}</span>`;
        
        // Append the total cost element to the 'pay-now-container'
        const payNowContainer = document.querySelector('.pay-now-container');
        payNowContainer.insertBefore(totalCostElement, payNowContainer.firstChild);
    } else {
        // Update the total cost if the element already exists
        document.getElementById('total-price').innerText = totalCost.toFixed(2);
    }
}

const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    let totalCost = 0;

    if(carts.length > 0){
        carts.forEach(cart => {
            totalQuantity += cart.quantity;

            // find product data in listProducts based on product ID
            let positionProduct = listProducts.findIndex((value) => value.id == cart.product_id);
            let info = listProducts[positionProduct];

            // Calculate cost for each product and add to total cost
            let productCost = (info.price / 100) * cart.quantity;
            totalCost += productCost;

            const newCart = document.createElement('div');
            newCart.classList.add('item');
            newCart.dataset.id = cart.product_id;
            newCart.innerHTML = `
                <div class="cart-item">
                    <div class="image">
                        <img src="${info.image}"/>
                    </div>
                    <div class="name">
                        ${info.name}
                    </div>
                    <div class="total-price">
                        $${Math.round(((info.price / 100) * cart.quantity) * 100) / 100}
                    </div>
                    <div class="quantity">
                        <img src="ASSETS/Minus.svg" class="minus"/>
                        <span>${cart.quantity}</span>
                        <img src="ASSETS/Plus.svg" class="plus"/>
                    </div>
                </div>
            `;
        listCartHTML.appendChild(newCart);
        });
        updateTotalCostHTML(totalCost);
    } else {
        const totalCostElement = document.querySelector('.total-cost');
        if (totalCostElement) {
            totalCostElement.remove();
        }
    }
    iconCartSpan.innerText = totalQuantity;
}

listCartHTML.addEventListener('click', (event) =>  {
    let positionClick = event.target;
    if(positionClick.classList.contains('minus') || positionClick.classList.contains('plus')) {
        let product_id = positionClick.closest('.item').dataset.id;
        let type = 'minus';
        if(positionClick.classList.contains('plus')){
            type = 'plus';
        }
        changeQuantity(product_id, type);
    };
})

const changeQuantity = (product_id, type) => {
    let positionItemInCart = carts.findIndex((value) => value.product_id == product_id);
    if(positionItemInCart >= 0){
        switch (type) {
            case 'plus':
                carts[positionItemInCart].quantity++;
                break;

            default:
                let valueChange = carts[positionItemInCart].quantity - 1;
                if(valueChange > 0){
                    carts[positionItemInCart].quantity = valueChange;
                } else {
                    carts.splice(positionItemInCart, 1);
                }
                break;
        }
    }
    addCartToMemory();
    addCartToHTML();
}

const initApp = () => {
    // fetches product data from json file
    fetch('/products.json')
    .then(response => response.json())
    .then(data => {
        listProducts = data;

        // get cart from memory
        if(localStorage.getItem('cart')){
            carts = JSON.parse(localStorage.getItem('cart'));
            addCartToHTML();
        }
    })
}
initApp();

/*---------------- SEND CART DATA TO THE BACKEND ----------------*/

/*---------------- SMOOTH SCROLL ----------------*/

// Ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', function() {
    // Select all anchor links with hashes
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
  
    smoothScrollLinks.forEach(anchor => {
      // Add click event listener to each link
      anchor.addEventListener('click', function(e) {
            // Prevent default anchor click behavior
            e.preventDefault();
  
            // Get the target element by the hash in the href
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
        
            // Check if the target element exists
            if (targetElement) {
            // Scroll smoothly to the target element
            targetElement.scrollIntoView({
                behavior: 'smooth', // Smooth scroll effect
                block: 'start' // Aligns the top of the element with the top of the viewport
                });
            }
        });
    });
});