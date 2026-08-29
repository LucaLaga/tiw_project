# 📚 Libreria Digitale (Digital Library App)

A full-stack web application for managing a digital library catalog. Users can browse books, register accounts, and borrow/return books. Organizers (admins) have elevated privileges to manage the inventory and track all library loans.

## ✨ Features

*   **Public Catalog:** Browse the library and search for books by title or ISBN.
*   **Authentication:** Secure user registration and login using `bcrypt` and `express-session`.
*   **Borrowing System:** Logged-in users can borrow and return books, dynamically updating the available stock.
*   **Personal Dashboard:** Users can track their active and past loans ("I miei prestiti").
*   **Organizer (Admin) Dashboard:** 
    *   View all loans across the entire system.
    *   Edit book details (Title, ISBN, Stock, etc.).
    *   Soft-delete books (hides them from the catalog without breaking relational data).

## 🛠️ Tech Stack

*   **Backend:** Node.js, Express.js
*   **Database:** SQLite3 (using `better-sqlite3`)
*   **Views:** Handlebars (`.hbs`)
*   **Security:** `bcrypt` (password hashing), Express Session

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository and install dependencies:**
```bash
npm install
```

2. **Initialize the Database:**
This will read the `schema.sql` and create the `database.sqlite` file.
```bash
node src/db/init.js
```

3. **Seed the Database:**
Populate the database with test authors, genres, books, and users.
```bash
node src/seed.js
```

4. **Start the Server:**
```bash
node server.js
```

*(Or run `npm run dev` if you have nodemon configured).*
5. **Visit the App:**
Open your browser and navigate to `http://localhost:3000` (or your configured port).

## 🔐 Default Test Accounts
If you ran the seed script, the following accounts are available for testing with the password **`password123`**:

* **Organizer (Admin):** `admin@library.it`
* **Standard User:** `bob@test.it`

## 📁 Project Structure highlights

* `/src/repos/` - Database logic and SQLite queries (`book.repo.js`, `user.repo.js`).
* `/src/db/` - Database connection, initialization scripts, and schema.
* `/views/` - Handlebars templates (Pages and Partials).
* `server.js` - Main Express application, routing, and middleware.

