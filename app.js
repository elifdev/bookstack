let bookList = [], 
cartList = [];

const toggleModal = () => {
    document.querySelector(".cart-modal").classList.toggle("active");
};

const getBooks = async () => {
    try {
        const res = await fetch("./products.json");
        bookList = await res.json();
        createBookTypesHtml();
        createBookItemsHtml(bookList);
    } catch (error) {
        console.error(" Error", error);
    }
};

getBooks();

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
                <span class="black fw-bold fs-5 me-2">${book.price}₺</span>
                ${book.oldPrice ? `<span class="gray old-price fs-5 fw-bold">${book.oldPrice}₺</span>` : ""}
              </div>
              <button class="btn-purple" onclick="addBookToCart(${book.id})">ADD TO CART</button>
            </div>
          </div>
      </div>
  `).join("");
};

const BOOK_TYPES = {
    All: "Tümü",
    SelfHelp: "Kişisel Gelişim",
    Literature: "Edebiyat",
    Science: "Bilim",
    FINANCE: "Ekonomi",
    Kids: "Çocuk",
    History: "Tarih"
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

const listCartItems = ()  => {
  localStorage.setItem("cartList", JSON.stringify(cartList));
  const cartListEl = document.querySelector(".cart-list");
  const cartCountEl = document.querySelector(".cart-count"); 
  cartCountEl.innerHTML = cartList.length > 0 ? cartList.length : null ;
  const totalPriceEl = document.querySelector(".total-price")
  let cartListHtml = "";
  let totalPrice = 0;
 
  cartList.forEach(item => {

     totalPrice += item.product.price * item.quantity;
     cartListHtml += ` 
            <li class="cart-item">
            <img src="${item.product.imgSource}" alt="">
            <div class="cart-item-info">
              <h3 class="book-name">${item.product.name}</h3>
              <span class="book-price"> ${item.product.price}₺</span><br>
              <span class="book-remove" onclick="removeItemToCart(${item.product.id})">remove</span>
            </div>
            <div class="book-count">
              <span class="decrease" onclick= "decreaseItemToCart(${item.product.id})">-</span>
              <span class="count">${item.quantity}</span>
              <span class="increase" onclick= "increaseItemToCart(${item.product.id})">+</span>
            </div>
          </li>`
  });
  cartListEl.innerHTML = cartListHtml ? cartListHtml :   
  `<li class="cart-item">Cart Empty</li>`;
  totalPriceEl.innerHTML = totalPrice > 0 ? "Total : " + totalPrice.toFixed(2) + "₺" : null ;
};

if(localStorage.getItem("cartList")){
  cartList = JSON.parse(localStorage.getItem("cartList"));
  listCartItems();
}



const addBookToCart = (bookId) => {
  let findedBook = bookList.find(book => book.id == bookId);
  if(findedBook) {
      const cartIndex = cartList.findIndex((cart) => cart.product.id == bookId);
      if(cartIndex == -1) {
          let addedItem = { quantity: 1, product: findedBook };
          cartList.push(addedItem);
      } else {
          
          if(cartList[cartIndex].quantity < cartList[cartIndex].product.stock) {
              cartList[cartIndex].quantity += 1;
              toastr.success("Book Added To Cart");
          } else {
              toastr.error("Product out of stock");
          }
          listCartItems();
          return;
        }
        listCartItems();
        toastr.success("Book Added To Cart");
      }
    };
    
    const decreaseItemToCart = (bookId) => {
      const findedIndex = cartList.findIndex((cart) => cart.product.id == bookId);
      if(findedIndex != -1) {
          if(cartList[findedIndex].quantity > 1) {
              cartList[findedIndex].quantity -= 1;
          } else {
              removeItemToCart(bookId);
              return; 
          }
          listCartItems(); 
      }
  };
  
  const increaseItemToCart = (bookId) => {
      const findedIndex = cartList.findIndex((cart) => cart.product.id == bookId);
      if(findedIndex != -1) {
          if(cartList[findedIndex].quantity < cartList[findedIndex].product.stock) {
              cartList[findedIndex].quantity += 1;
              listCartItems(); 
          } else {
              toastr.error("Product out of stock");
          }
      }
  };
  
  const removeItemToCart = (bookId) => {
      const findedIndex = cartList.findIndex((cart) => cart.product.id == bookId);
      if(findedIndex != -1) {
          cartList.splice(findedIndex, 1);
      }
      listCartItems();
  };

document.querySelector(".cart-modal").addEventListener("click", (e) => {
  if (e.target.classList.contains("cart-modal")) {
      toggleModal();
  }
});