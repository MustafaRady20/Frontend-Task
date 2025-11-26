# Store Inventory Frontend Task

This is a **React-based frontend task** demonstrating store inventory management with user authentication.

---

## Features Implemented

* **Mock Backend**

  * `json-server` used as a mock server on port `8080`.
  * Seeded with stores, books, authors, and inventory data using `migrate-data.js`.

* **Store Inventory Page**

  * View all books related to a specific store.
  * Add new books to a store.
  * Edit book prices.
  * Delete books from the store.
  * Sorting and filtering with `@tanstack/react-table`.

* **Authentication**

  * Sign In and Sign Out implemented.
  * Non-logged-in users cannot perform admin actions (Add/Edit/Delete).

---

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Install `json-server` :

```bash
npm install -g json-server
```

3. Run the mock server on port 8080:

```bash
json-server --watch db.json --port 8080
```

4. Seed data:

```bash
node migrate-data.js
```

5. Start the React frontend:

```bash
npm start
```

---

## Authentication Details

* User data is stored in cookies using `js-cookie`.
* Admin functions (Add/Edit/Delete) are only accessible for logged-in users.
* Non-logged-in users can only browse the store inventory.

---


.env.development 
VITE_USE_MOCK=true


.env.production
VITE_USE_MOCK=false


admin account for login 

admin
admin123


**Mostafa Rady** – Frontend Developer

