# E-Commerce API (NestJS)

A scalable, production-shaped e-commerce backend built with **NestJS**, **Prisma**, and **MongoDB** — built as a learning project to practice real-world e-commerce concerns: catalog, cart, checkout, payments, shipping, and reviews.

## Features

- **Auth** — JWT authentication with OTP-based verification and password reset
- **Customer** — accounts, credentials, saved addresses
- **Admin** — separate admin accounts/credentials for store management
- **Products & Variants** — products with category and per-variant (size/color/price/stock) support
- **Category** — hierarchical product categories
- **Cart** — add/update/remove items, per-customer cart state
- **Order & Order History** — order lifecycle tracking
- **Payment** — Stripe and Razorpay integration, configurable via `PAYMENT_MODE`
- **Shipment & Shipment Status** — order fulfillment/shipping status tracking
- **Reviews** — customer product reviews
- **QR Code** — QR code generation (e.g. for order/receipt lookup)
- **PDF Invoices** — generated with `pdfkit`
- **Scheduled Mail** — cron-based email jobs (`node-schedule` + Handlebars templates)
- **Swagger** — interactive API docs generated from decorators
- **Docker** — `Dockerfile` + `docker-compose.yml` for containerized runs

## Tech Stack

- [NestJS 10](https://nestjs.com/) (TypeScript)
- [Prisma](https://www.prisma.io/) ORM on **MongoDB**
- Passport + `@nestjs/jwt` for authentication
- Stripe & Razorpay for payments
- Postmark for transactional email, Handlebars for templates, `node-schedule` for cron jobs
- `pdfkit` for invoice/PDF generation, `qrcode` for QR generation
- Docker & Docker Compose
- Jest for unit/e2e testing

## Project Structure

```
src/
├── auth/               # login, JWT strategy, OTP verification, password reset
├── user/               # customer accounts
├── adress/             # customer addresses
├── products/           # product CRUD
├── product_variant/    # product variants (size/color/stock/price)
├── category/           # product categories
├── cart/               # shopping cart
├── payment/            # Stripe / Razorpay integration
├── shipment/           # shipment & shipment status
├── reviews/            # customer product reviews
├── qrcode/             # QR code generation
├── sheduled-mail/      # cron email jobs
├── shared/             # shared utilities/services
├── validator/          # custom DTO validators
└── prisma/             # Prisma service/module
prisma/
└── schema.prisma       # data model (MongoDB)
```

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB connection string (replica-set enabled, required by Prisma)
- Stripe and/or Razorpay API keys
- A Postmark API key (transactional email)

### Setup

```bash
git clone https://github.com/vsmm-world/e-commerce-project-using-nestjs.git
cd e-commerce-project-using-nestjs
npm install
```

Create a `.env` file in the project root:

```bash
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority"
POST_MARK_API_KEY="your-postmark-api-key"
STRIPE_KEY="your-stripe-secret-key"
PAYMENT_MODE="stripe"   # or "razorpay"
```

Generate the Prisma client and sync the schema:

```bash
npm run prisma-all
```

Run the app:

```bash
npm run start:dev
```

The API will be available at `http://localhost:5000`, with Swagger docs at `http://localhost:5000/api`.

### Run with Docker

```bash
docker-compose up --build
```

### Tests

```bash
npm run test        # unit tests
npm run test:e2e     # e2e tests
npm run test:cov     # coverage report
```

## Author

**Ravindra Valand**
- GitHub: [@vsmm-world](https://github.com/vsmm-world)
- LinkedIn: [Ravindra Valand](https://in.linkedin.com/in/ravindra-valand)
- Instagram: [@ravindra_valand](https://www.instagram.com/ravindra_valand/)
- YouTube: [Ravindra Valand](https://www.youtube.com/@RavindraValand)

## License

UNLICENSED — personal learning project, not intended for production use.
