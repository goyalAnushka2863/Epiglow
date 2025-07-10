
# Epiglow

**Your Ultimate Skincare Shopping Destination**

Epiglow is a modern, responsive e-commerce platform for skincare products. It features a smooth user experience with login/signup, dynamic product listings, shopping cart, checkout, and more. Built using the MERN stack and Tailwind CSS, it's optimized for both performance and aesthetics.

---

## Features

- User authentication (signup/login/logout)
- Product catalog with search and filters
- Shopping cart with quantity updates
- Checkout flow (dummy for now)
- Responsive design for all screen sizes
- Informational pages (About, Contact, FAQs, Terms & Conditions)

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Deployment (Planned):** Render / Vercel

---

## Getting Started

### Prerequisites

- Node.js (v16 or above)
- npm
- MongoDB (local or Atlas)

### Installation

Clone the repository:

```bash
git clone https://github.com/goyalAnushka2863/Epiglow
cd Epiglow
````

Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Running the App Locally

Start the backend:

```bash
cd backend
npm start
```

Start the frontend (in a separate terminal):

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## Folder Structure

```
Epiglow/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   └── ...
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── ...
    └── vite.config.js
```

---

## Future Enhancements

* Admin panel for product management
* Payment gateway integration
* Wishlist functionality
* Order history & tracking
* Improved error handling
* Unit & integration tests


