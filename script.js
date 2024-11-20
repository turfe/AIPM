
// Product Data
const cardData = [
    {
        images: [
            'https://static.zara.net/assets/public/3320/4175/2d434fe08bff/d796d132ebc8/07484455708-e1/07484455708-e1.jpg?ts=1727256197645&w=850',
            'https://static.zara.net/assets/public/4d4d/4f22/db66499b8ee7/6b93ddaa7771/07484455708-e2/07484455708-e2.jpg?ts=1727256190410&w=850',
            'https://static.zara.net/assets/public/b614/2b41/3f184676930b/79dfa0790346/07484455708-e3/07484455708-e3.jpg?ts=1727256231406&w=850'
        ],
        title: 'Beige Jacket',
        description: 'A smart beige jacket perfect for evening occasions.',
        price: '120 CHF',
        shopUrl: 'https://example.com/shop/red-dress',
        reviews: [
            {
                name: 'Alice',
                rating: 5,
                comment: 'Absolutely love this dress!'
            },
            {
                name: 'Emma',
                rating: 4,
                comment: 'Great fit, but the color was slightly different than expected.'
            }
        ]
    },
    {
        images: [
            'https://static.zara.net/assets/public/f945/aff7/c07d443d826e/48c1a60fcb34/07484453800-e1/07484453800-e1.jpg?ts=1726733255631&w=850',
            'https://static.zara.net/assets/public/4928/ad36/2d894f9aa810/ad0dc7c7e464/07484453800-e2/07484453800-e2.jpg?ts=1726733256117&w=850',
            'https://static.zara.net/assets/public/73eb/abef/d22b4ebf8fcf/24968c02d7f7/07484453800-e3/07484453800-e3.jpg?ts=1726733257117&w=850'
        ],
        title: 'Blue Jeans',
        description: 'Comfortable blue jeans for everyday wear.',
        price: '80 CHF',
        shopUrl: 'https://example.com/shop/blue-jeans',
        reviews: [
            {
                name: 'John',
                rating: 4,
                comment: 'Very comfortable and stylish.'
            },
            {
                name: 'Sophia',
                rating: 5,
                comment: 'My favorite pair of jeans!'
            }
        ]
    },
    {
        images: [
            'https://static.zara.net/assets/public/ec02/0fc8/fa67461d8cc9/e95c5c34dc43/00706310801-e1/00706310801-e1.jpg?ts=1729511378643&w=850',
            'https://static.zara.net/assets/public/171f/0e08/1a3c4ab6a31f/de31a3b83e6e/00706310801-e2/00706310801-e2.jpg?ts=1729511379336&w=850',
            'https://static.zara.net/assets/public/6218/5d5e/459147568aa0/d4982583ef3d/00706310801-e3/00706310801-e3.jpg?ts=1729511385732&w=850',
        ],
        title: 'Leather Jacket',
        description: 'Stylish leather jacket to keep you warm.',
        price: '200 CHF',
        shopUrl: 'https://example.com/shop/leather-jacket',
        reviews: [
            {
                name: 'Michael',
                rating: 5,
                comment: 'Excellent quality and fits perfectly.'
            },
            {
                name: 'Olivia',
                rating: 3,
                comment: 'Good jacket but the zipper is a bit stiff.'
            }
        ]
    }
    // Add more items as needed
];

const cardContainer = document.getElementById('card-container');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsList = document.getElementById('cartItems');
const closeCartBtn = document.getElementById('closeCartBtn');

const reviewsOverlay = document.getElementById('reviewsOverlay');
const reviewsContent = document.getElementById('reviewsContent');
const reviewsList = document.getElementById('reviewsList');
const closeReviewsBtn = document.getElementById('closeReviewsBtn');

let currentIndex = 0;
let cart = [];

// Function to Create Card
function createCard(item) {
    const card = document.createElement('div');
    card.className = 'card';

    // Create image carousel
    let carouselImages = '';
    item.images.forEach((imgSrc, index) => {
        carouselImages += `<img src="${imgSrc}" alt="${item.title}" class="${index === 0 ? 'active' : ''}">`;
    });

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
<div class="info">
   <div class = "desc"f><h3>${item.title}</h3><div class="price">${item.price}</div></div>
    <p>${item.description}</p>
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
    if (currentIndex < cardData.length) {
        createCard(cardData[currentIndex]);
        currentIndex++;
    } else {
        alert('No more items!');
    }
}

// Function to Handle Actions
function handleAction(action, card) {
    if (card) {
        if (action === 'like') {
            card.style.transform = `translateX(1000px) rotate(45deg)`;
        } else if (action === 'dislike') {
            card.style.transform = `translateX(-1000px) rotate(-45deg)`;
        } else if (action === 'buy') {
            cart.push(cardData[currentIndex - 1]);
            card.style.transform = `translateY(-1000px)`;
            alert(`"${cardData[currentIndex - 1].title}" has been added to your cart.`);
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
                <img src="${item.images[0]}" alt="${item.title}">
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

// Initialize First Card
showNextCard();