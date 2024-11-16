const STORAGE_KEY = 'BOOKSHELF_APPS';
const RENDER_EVENT = 'render-books';
const SAVED_EVENT = 'saved-books';

// Inisialisasi array books dari localStorage
let books = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

document.addEventListener('DOMContentLoaded', function () {
    const bookForm = document.getElementById('bookForm');
    const searchForm = document.getElementById('searchBook');
    
    bookForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addBook();
    });
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        searchBooks();
    });

    // Load initial data
    if (isStorageExist()) {
        loadDataFromStorage();
    }

    // Set up checkbox listener for submit button text
    document.getElementById('bookFormIsComplete').addEventListener('change', function() {
        const submitButton = document.getElementById('bookFormSubmit');
        const statusText = submitButton.querySelector('span');
        statusText.textContent = this.checked ? 'Selesai dibaca' : 'Belum selesai dibaca';
    });
});

function isStorageExist() {
    if (typeof Storage === undefined) {
        alert('Browser tidak mendukung local storage');
        return false;
    }
    return true;
}

function generateId() {
    return +new Date();
}

function addBook() {
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = parseInt(document.getElementById('bookFormYear').value);
    const isComplete = document.getElementById('bookFormIsComplete').checked;
    
    const id = generateId();
    const bookObject = {
        id,
        title,
        author,
        year,
        isComplete
    };
    
    books.push(bookObject);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    
    // Reset form
    document.getElementById('bookForm').reset();
    // Reset submit button text
    document.getElementById('bookFormSubmit').querySelector('span').textContent = 'Belum selesai dibaca';
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
        console.log('Data berhasil disimpan ke localStorage');
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    
    if (serializedData) {
        books = JSON.parse(serializedData);
        document.dispatchEvent(new Event(RENDER_EVENT));
        console.log('Data berhasil dimuat dari localStorage');
    }
}

function createBookElement(bookObject) {
    const bookItem = document.createElement('div');
    bookItem.classList.add('book-item');
    bookItem.setAttribute('data-bookid', bookObject.id);
    bookItem.setAttribute('data-testid', 'bookItem');
    
    const title = document.createElement('h3');
    title.setAttribute('data-testid', 'bookItemTitle');
    title.innerText = bookObject.title;
    
    const author = document.createElement('p');
    author.setAttribute('data-testid', 'bookItemAuthor');
    author.innerText = `Penulis: ${bookObject.author}`;
    
    const year = document.createElement('p');
    year.setAttribute('data-testid', 'bookItemYear');
    year.innerText = `Tahun: ${bookObject.year}`;
    
    const buttonContainer = document.createElement('div');
    
    const toggleButton = document.createElement('button');
    toggleButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    toggleButton.innerText = bookObject.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
    toggleButton.onclick = () => toggleBookStatus(bookObject.id);
    
    const deleteButton = document.createElement('button');
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.innerText = 'Hapus Buku';
    deleteButton.onclick = () => removeBook(bookObject.id);
    
    const editButton = document.createElement('button');
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.innerText = 'Edit Buku';
    editButton.onclick = () => editBook(bookObject.id);
    
    buttonContainer.append(toggleButton, deleteButton, editButton);
    bookItem.append(title, author, year, buttonContainer);
    
    return bookItem;
}

function toggleBookStatus(bookId) {
    const bookTarget = books.find(book => book.id === bookId);
    
    if (bookTarget == null) return;
    
    bookTarget.isComplete = !bookTarget.isComplete;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBook(bookId) {
    const bookIndex = books.findIndex(book => book.id === bookId);
    
    if (bookIndex !== -1) {
        books.splice(bookIndex, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
}

function editBook(bookId) {
    const book = books.find(book => book.id === bookId);
    if (!book) return;
    
    document.getElementById('bookFormTitle').value = book.title;
    document.getElementById('bookFormAuthor').value = book.author;
    document.getElementById('bookFormYear').value = book.year;
    document.getElementById('bookFormIsComplete').checked = book.isComplete;
    
    // Update submit button text based on isComplete status
    const submitButton = document.getElementById('bookFormSubmit');
    const statusText = submitButton.querySelector('span');
    statusText.textContent = book.isComplete ? 'Selesai dibaca' : 'Belum selesai dibaca';
    
    removeBook(bookId);
    
    document.getElementById('bookFormTitle').focus();
}

function searchBooks(e) {
    const searchTerm = document.getElementById('searchBookTitle').value.toLowerCase();
    const filteredBooks = searchTerm === '' 
        ? books 
        : books.filter(book => book.title.toLowerCase().includes(searchTerm));
    
    renderFilteredBooks(filteredBooks);
}

function renderFilteredBooks(filteredBooks) {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');
    
    // Clear the lists
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';
    
    // Render filtered books
    for (const book of filteredBooks) {
        const bookElement = createBookElement(book);
        if (book.isComplete) {
            completeBookList.append(bookElement);
        } else {
            incompleteBookList.append(bookElement);
        }
    }
}

// Event listener untuk render
document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');
    
    // Clear the lists
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';
    
    // Render all books
    for (const book of books) {
        const bookElement = createBookElement(book);
        if (book.isComplete) {
            completeBookList.append(bookElement);
        } else {
            incompleteBookList.append(bookElement);
        }
    }
});