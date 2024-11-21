
// Product Data
let cardData = [

];

// HARCODE
for (let i = 0; i <= 95; i++) {
    cardData.push(i);
}

const cardContainer = document.getElementById('card-container');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsList = document.getElementById('cartItems');
const closeCartBtn = document.getElementById('closeCartBtn');

const reviewsOverlay = document.getElementById('reviewsOverlay');
const reviewsContent = document.getElementById('reviewsContent');
const reviewsList = document.getElementById('reviewsList');
const closeReviewsBtn = document.getElementById('closeReviewsBtn');

let currentIndex = 0;
let prevIndex = 50 // random
let nextIndex = 0
let cart = [];
let queue = [];

// Function to Create Card
function createCard(item) {
    const card = document.createElement('div');
    card.className = 'card';

    // Create image carousel
    let carouselImages = '';
    let imgSrcCur = 'images/image_' + currentIndex.toString() + '.jpg';
    console.log(imgSrcCur);
    // item.images.forEach((imgSrc, index) => {
        carouselImages += `<img src="${imgSrcCur}" class="${'active'}">`;
    // });

    card.innerHTML = `
<button class="cartBtn"><i class="bi bi-cart"></i></button>
<button class="reviewBtn"><i class="bi bi-star"></i></button>
<div class="carousel">
    ${carouselImages}
    <div class="nav">
        <button class="prevBtn"><i class="bi bi-chevron-left"></i></button>
        <button class="nextBtn"><i class="bi bi-chevron-right"></i></button>
    </div>
</div>
<div class="buttons">
    <button id="dislikeBtn"><i class="bi bi-hand-thumbs-down"></i></button>
    <button id="buyBtn"><i class="bi bi-cart"></i></button>
    <button id="likeBtn"><i class="bi bi-hand-thumbs-up"></i></button>
</div>
    `;
    cardContainer.appendChild(card);

    // Attach event listeners to the buttons within the card
    const likeBtn = card.querySelector('#likeBtn');
    const dislikeBtn = card.querySelector('#dislikeBtn');
    const buyBtn = card.querySelector('#buyBtn');
    const cardCartBtn = card.querySelector('.cartBtn');
    const reviewBtn = card.querySelector('.reviewBtn');
    const prevBtn = card.querySelector('.prevBtn');
    const nextBtn = card.querySelector('.nextBtn');
    const images = card.querySelectorAll('.carousel img');

    let currentImageIndex = 0;

    // Carousel Navigation Functions
    function showImage(index) {
        images.forEach((img, idx) => {
            img.classList.toggle('active', idx === index);
        });
    }

    prevBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        showImage(currentImageIndex);
    });

    nextBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        currentImageIndex = (currentImageIndex + 1) % images.length;
        showImage(currentImageIndex);
    });

    likeBtn.addEventListener('click', () => handleAction('like', card));
    dislikeBtn.addEventListener('click', () => handleAction('dislike', card));
    buyBtn.addEventListener('click', () => handleAction('buy', card));
    cardCartBtn.addEventListener('click', openCart);
    reviewBtn.addEventListener('click', () => openReviews(item));
}

// Function to Show Next Card
function showNextCard() {
    if (queue.length > 1) {
        prevIndex = currentIndex;
        currentIndex = queue[0];
        queue.shift();
        nextIndex = queue[0];
        createCard(cardData[currentIndex]);
    } else {
        fetch('http://localhost:5000/get_images')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    queue = queue.concat(data.images);
                    showNextCard();
                } else if (data.status === 'empty') {
                    console.log('Image queue is empty, sending liked images');
                }
            });
        // console.log(queue)
    }
}

// Function to Handle Actions
function handleAction(action, card) {
    if (card) {
        if (action === 'like') {
            card.style.transform = `translateX(1000px) rotate(45deg)`;
            fetch('http://localhost:5000/like_image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ liked_image: currentIndex }),
            })
            .then(response => response.json())
        } else if (action === 'dislike') {
            card.style.transform = `translateX(-1000px) rotate(-45deg)`;
            fetch('http://localhost:5000/dislike_image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ disliked_image: currentIndex }),
            })
            .then(response => response.json())
        } else if (action === 'buy') {
            cart.push(cardData[currentIndex - 1]);
            card.style.transform = `translateY(-1000px)`;
            alert(`"${cardData[currentIndex - 1].title}" has been added to your cart.`);

            fetch('http://localhost:5000/like_image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ liked_image: currentIndex }),
            })
            .then(response => response.json())
        
        }
        setTimeout(() => {
            card.remove();
            showNextCard();
        }, 300);
    }
}

// Function to Open Cart Overlay
function openCart() {
    cartItemsList.innerHTML = '';
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<li>Your cart is empty.</li>';
    } else {
        cart.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${item}" alt="${item.title}">
                <div>
                    <strong>${item.title}</strong>
                    <p>${item.description}</p>
                    <p><strong>Price:</strong> ${item.price}</p>
                    <a href="${item.shopUrl}" target="_blank" class="goToShopBtn">Go to Shop</a>
                </div>
            `;
            cartItemsList.appendChild(li);
        });
    }
    cartOverlay.style.display = 'flex';
}

// Function to Open Reviews Overlay
function openReviews(item) {
    reviewsList.innerHTML = '';
    if (item.reviews && item.reviews.length > 0) {
        item.reviews.forEach(review => {
            const li = document.createElement('li');
            const stars = '<i class="bi bi-star-fill"></i>'.repeat(review.rating);
            li.innerHTML = `
                <img src="https://via.placeholder.com/60?text=${review.name.charAt(0)}" alt="${review.name}">
                <div>
                    <strong>${review.name}</strong>
                    <span class="star-rating">${stars}</span>
                    <p>${review.comment}</p>
                </div>
            `;
            reviewsList.appendChild(li);
        });
    } else {
        reviewsList.innerHTML = '<li>No reviews available for this item.</li>';
    }
    reviewsOverlay.style.display = 'flex';
}

// Event Listener for Closing Cart
closeCartBtn.addEventListener('click', () => {
    cartOverlay.style.display = 'none';
});

// Event Listener for Closing Reviews
closeReviewsBtn.addEventListener('click', () => {
    reviewsOverlay.style.display = 'none';
});

// document.addEventListener("DOMContentLoaded", function() {
    // Load the Excel file from a specific path
    // fetch('wornwear.xlsx') // Replace 'data.xlsx' with the relative path of your Excel file
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error('Network response was not ok');
    //         }
    //         return response.arrayBuffer();
    //     })
    //     .then(data => {
//             // Use SheetJS to parse the Excel file
            // const workbook = XLSX.read(wornwear.xlsx, { type: 'array' });
            // const sheetName = workbook.SheetNames[0]; // Assuming you want to work with the first sheet
            // const worksheet = workbook.Sheets[sheetName];

            // // Convert the worksheet to JSON format
            // const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // // Assuming that the first row has parameter names
            // const headers = jsonData[0];
            // const rows = jsonData.slice(1); // Data starts from the second row

            // rows.forEach(row => {
            //     let element = {};
            //     headers.forEach((header, index) => {
            //         element[header] = row[index];
            //     });
            //     cardData.push(element);
            // });
            
            // console.log(cardData.length);
            
            // cardData.forEach(element => {
            //     console.log(JSON.stringify(structuredClone(element), null, 2));
            //   });

// Initialize First Card
// Display elements in the HTML page for demonstration
// document.getElementById('output').textContent = JSON.stringify(cardData, null, 2);
showNextCard();
        // })
        // .catch(error => {
        //     console.error('Error fetching the Excel file:', error);
        // });
// });
