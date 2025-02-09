let bookList = [];

const toggleModal = () => {
    const cartModal = document.querySelector(".cart-modal"); 
    cartModal.classList.toggle("active");
}

const getBooks = () => {
    fetch("./products.json").then((res) = res.json()).then((books) => (bookList = books));
}

getBooks();

const createBookItemsHtml = () => {
    const bookListEl = document.querySelector(".book-list");
    let bookListHtml = "";
    bookList.forEach(book => {
        bookListHtml += ``;
    });

    bookListEl.innerHTML = bookListHtml;
};