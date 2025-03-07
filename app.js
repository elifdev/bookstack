let bookList = [], 
    cartList = [],
    users = [],
    currentUser = null;

let searchModal, authModal, profileModal, personIcon, cartModal;

const toggleModal = () => {
    cartModal.classList.toggle("active");
};

function toggleMenu() {
    const menu = document.querySelector('.menu');
    menu.classList.toggle('show');
}

function initializeFilterScroll() {
    const filter = document.querySelector('.filter');
    if (window.innerWidth <= 768) {
        const filterWidth = filter.scrollWidth;
        const containerWidth = filter.clientWidth;
        
        if (filterWidth > containerWidth) {
            const scrollPosition = (filterWidth - containerWidth) / 2;
            filter.scrollLeft = scrollPosition;
        }
    }
}

window.addEventListener('load', initializeFilterScroll);
window.addEventListener('resize', initializeFilterScroll);

const getBooks = async () => {
    try {
        const res = await fetch("./products.json");
        bookList = await res.json();
        createBookTypesHtml();
        createBookItemsHtml(bookList);
    } catch (error) {
        console.error("Error", error);
        toastr.error("Books could not be loaded. Please try again later.");
    }
};

const createBookStars = (starRate) => {
    let starRateHtml = "";
    for (let i = 1; i <= 5; i++) {
        starRateHtml += i <= Math.round(starRate) 
            ? `<i class="bi bi-star-fill active"></i>` 
            : `<i class="bi bi-star"></i>`;
    }
    return starRateHtml;
};

const createBookItemsHtml = (filteredBooks) => {
    const bookListEl = document.querySelector(".book-list");
    bookListEl.innerHTML = filteredBooks.map((book, index) => `
        <div class="col-12 col-lg-5 ${index % 2 === 0 ? "offset-lg-2" : ""} my-5">
            <div class="row book-card">
                <div class="col-12 col-lg-6">
                    <img class="img-fluid shadow" src="${book.imgSource}" alt="${book.name}">
                </div>
                <div class="col-12 col-lg-6 d-flex flex-column justify-content-between mt-3 mt-lg-0">
                    <div class="book-detail">
                        <span class="book-author font gray fs-5">${book.author}</span><br>
                        <span class="book-name fs-4 fw-bold">${book.name}</span><br>
                        <span class="book-star-rate">
                            ${createBookStars(book.starRate)}
                            <span class="gray">${book.reviewCount}</span>
                        </span>
                    </div>
                    <p class="book-desc font gray">${book.description}</p>
                    <div>
                        <span class="black fw-bold fs-5 me-2">${book.price}$</span>
                        ${book.oldPrice ? `<span class="gray old-price fs-5 fw-bold">${book.oldPrice}$</span>` : ""}
                    </div>
                    <button class="btn-purple" onclick="addBookToCart(${book.id})">ADD TO CART</button>
                </div>
            </div>
        </div>
    `).join("");
};

const BOOK_TYPES = {
    All: "All",
    SelfHelp: "Self Help",
    Literature: "Literature",
    Science: "Science",
    FINANCE: "Finance",
    Kids: "Kids",
    History: "History"
};

const createBookTypesHtml = () => {
    const filterEl = document.querySelector(".filter");
    let filterTypes = ["All", ...new Set(bookList.map(book => book.type))];
    filterEl.innerHTML = filterTypes.map((type, index) => `
        <li class="${index === 0 ? "active" : ""}" onclick="filterBooks(this)" data-type="${type}">
            ${BOOK_TYPES[type] || type}
        </li>
    `).join("");
};

const filterBooks = (filterEl) => {
    document.querySelectorAll(".filter li").forEach(el => el.classList.remove("active"));
    filterEl.classList.add("active");
    let bookType = filterEl.dataset.type;
    let filteredBooks = bookType === "All" ? bookList : bookList.filter(book => book.type === bookType);
    createBookItemsHtml(filteredBooks);
};

const listCartItems = () => {
    localStorage.setItem("cartList", JSON.stringify(cartList));
    const cartListEl = document.querySelector(".cart-list");
    const cartCountEl = document.querySelector(".cart-count"); 
    cartCountEl.innerHTML = cartList.length > 0 ? cartList.length : null;
    const totalPriceEl = document.querySelector(".total-price");
    let cartListHtml = "";
    let totalPrice = 0;
 
    cartList.forEach(item => {
        totalPrice += item.product.price * item.quantity;
        cartListHtml += ` 
            <li class="cart-item">
                <img src="${item.product.imgSource}" alt="${item.product.name}">
                <div class="cart-item-info">
                    <h3 class="book-name">${item.product.name}</h3>
                    <span class="book-price">${item.product.price}$</span><br>
                    <span class="book-remove" onclick="removeItemToCart(${item.product.id})">remove</span>
                </div>
                <div class="book-count">
                    <span class="decrease" onclick="decreaseItemToCart(${item.product.id})">-</span>
                    <span class="count">${item.quantity}</span>
                    <span class="increase" onclick="increaseItemToCart(${item.product.id})">+</span>
                </div>
            </li>`;
    });
    
    cartListEl.innerHTML = cartListHtml || `<li class="cart-item">Cart Empty</li>`;
    totalPriceEl.innerHTML = totalPrice > 0 ? "Total: " + totalPrice.toFixed(2) + "$" : null;
};

const addBookToCart = (bookId) => {
    const foundBook = bookList.find(book => book.id == bookId);
    if (!foundBook) return;
    
    const cartIndex = cartList.findIndex(cart => cart.product.id == bookId);
    
    if (cartIndex === -1) {
        const addedItem = { quantity: 1, product: foundBook };
        cartList.push(addedItem);
        listCartItems();
        toastr.success("Book Added To Cart");
    } else {
        if (cartList[cartIndex].quantity < cartList[cartIndex].product.stock) {
            cartList[cartIndex].quantity += 1;
            listCartItems();
            toastr.success("Book Added To Cart");
        } else {
            toastr.error("Product out of stock");
        }
    }
};

const decreaseItemToCart = (bookId) => {
    const foundIndex = cartList.findIndex(cart => cart.product.id == bookId);
    if (foundIndex === -1) return;
    
    if (cartList[foundIndex].quantity > 1) {
        cartList[foundIndex].quantity -= 1;
        listCartItems();
    } else {
        removeItemToCart(bookId);
    }
};

const increaseItemToCart = (bookId) => {
    const foundIndex = cartList.findIndex(cart => cart.product.id == bookId);
    if (foundIndex === -1) return;
    
    if (cartList[foundIndex].quantity < cartList[foundIndex].product.stock) {
        cartList[foundIndex].quantity += 1;
        listCartItems();
    } else {
        toastr.error("Product out of stock");
    }
};

const removeItemToCart = (bookId) => {
    const foundIndex = cartList.findIndex(cart => cart.product.id == bookId);
    if (foundIndex !== -1) {
        cartList.splice(foundIndex, 1);
    }
    listCartItems();
};

const searchBooks = () => {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) return;
    
    const filteredBooks = bookList.filter(book => 
        book.name.toLowerCase().includes(searchTerm) || 
        book.author.toLowerCase().includes(searchTerm) || 
        book.name.toLowerCase().replace(/ı/g, 'i').includes(searchTerm.replace(/ı/g, 'i')) ||
        book.author.toLowerCase().replace(/ı/g, 'i').includes(searchTerm.replace(/ı/g, 'i'))
    );
    
    if (filteredBooks.length === 0) {
        toastr.warning('No books found matching your search.');
    }
    
    createBookItemsHtml(filteredBooks);
    searchInput.value = '';
};

const handleSearch = () => {
    searchModal.classList.toggle('show');
};

const toggleAuthModal = () => {
    if (profileModal.classList.contains('show')) {
        profileModal.classList.remove('show');
    }
    
    authModal.classList.toggle('show');
    
    document.getElementById('loginError').textContent = '';
    document.getElementById('registerError').textContent = '';
};

const register = () => {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorEl = document.getElementById('registerError');

    if (!name || !email || !password || !confirmPassword) {
        errorEl.textContent = 'Please fill all fields.';
        return;
    }

    if (password !== confirmPassword) {
        errorEl.textContent = 'Passwords do not match.';
        return;
    }

    const emailExists = users.some(user => user.email === email);
    if (emailExists) {
        errorEl.textContent = 'This email is already registered.';
        return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Form alanlarını temizle
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    toastr.success('Registration successful. You can now log in.');
    
    document.querySelector('.auth-tab[data-tab="login"]').click();
};

const login = () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    if (!email || !password) {
        errorEl.textContent = 'Email and password are required.';
        return;
    }

    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        toastr.success(`Hello, ${user.name}!`);
        authModal.classList.remove('show');
        
        updateProfileMenuVisibility();
        toggleProfileModal();
    } else {
        errorEl.textContent = 'Invalid email or password.';
    }
};

const logout = () => {
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    toastr.info('Logged out successfully.');
    updateProfileMenuVisibility();
};

const toggleProfileModal = () => {
    if (authModal.classList.contains('show')) {
        authModal.classList.remove('show');
    }
    
    profileModal.classList.toggle('show');
    
    if (profileModal.classList.contains('show') && currentUser) {
        console.log("Current user:", currentUser);
        console.log("Profile name element:", document.getElementById('profileName'));
        console.log("Profile email element:", document.getElementById('profileEmail'));
        
        if (document.getElementById('profileName') && document.getElementById('profileEmail')) {
            document.getElementById('profileName').textContent = currentUser.name;
            document.getElementById('profileEmail').textContent = currentUser.email;
        } else {
            console.error("Profile elements not found in DOM");
        }
    } else {
        console.log("Profile modal not shown or currentUser is null:", 
                   { modalShown: profileModal.classList.contains('show'), currentUser });
    }
};

const goToCart = () => {
    toggleProfileModal(); 
    toggleModal(); 
};

const updateProfileMenuVisibility = () => {
    if (currentUser) {
        personIcon.classList.add('logged-in');
        personIcon.style.cursor = 'pointer';
        personIcon.onclick = toggleProfileModal;
    } else {
        personIcon.classList.remove('logged-in');
        personIcon.style.cursor = 'default';
        personIcon.onclick = toggleAuthModal;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    searchModal = document.getElementById('searchModal');
    authModal = document.getElementById('authModal');
    profileModal = document.getElementById('profileModal');
    personIcon = document.querySelector('.bi-person');
    cartModal = document.querySelector(".cart-modal");
    
    users = JSON.parse(localStorage.getItem('users')) || [];
    currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    
    if (localStorage.getItem("cartList")) {
        cartList = JSON.parse(localStorage.getItem("cartList"));
        listCartItems();
    }
    
    cartModal.addEventListener("click", (e) => {
        if (e.target.classList.contains("cart-modal")) {
            toggleModal();
        }
    });
    
    authModal.addEventListener('click', (e) => {
        if (e.target.id === 'authModal') {
            toggleAuthModal();
        }
    });
    
    profileModal.addEventListener('click', (e) => {
        if (e.target.id === 'profileModal') {
            toggleProfileModal();
        }
    });
    
    document.addEventListener('click', (e) => {
        if (searchModal && searchModal.classList.contains('show') && 
            !e.target.closest('#searchModal') && 
            !e.target.classList.contains('bi-search')) {
            searchModal.classList.remove('show');
        }
    });
    
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const targetTab = tab.dataset.tab;
            document.getElementById('loginForm').style.display = 
                targetTab === 'login' ? 'flex' : 'none';
            document.getElementById('registerForm').style.display = 
                targetTab === 'register' ? 'flex' : 'none';
        });
    });
    
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabs = ['userInfo', 'addresses', 'orders'];
            tabs.forEach(tabName => {
                const content = document.getElementById(`${tabName}Content`);
                content.style.display = tab.dataset.tab === tabName ? 'block' : 'none';
            });
        });
    });
    
    const btnAddAddress = document.querySelector('.btn-add-address');
    if (btnAddAddress) {
        btnAddAddress.addEventListener('click', () => {
            toastr.info('This feature is under construction');
        });
    }
    
    const btnEdit = document.querySelector('.btn-edit');
    if (btnEdit) {
        btnEdit.addEventListener('click', () => {
            toastr.info('This feature is under construction');
        });
    }
    
    updateProfileMenuVisibility();
    
    getBooks();
});