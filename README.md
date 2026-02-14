# Nerlya Judaica - Luxury Judaica Store

A professional React + Vite e-commerce application for a luxury Judaica store, featuring elegant design inspired by premium Judaica retailers.

## Features

- **Homepage**: Beautiful product grid showcasing all products
- **Product Detail Page**: Comprehensive product view with variants, gallery, and detailed information
- **Supabase Integration**: Connected to products, product_variants, and product_gallery tables
- **Image Handling**: Automatic image loading from Supabase Storage bucket (productimages)
- **Luxury Design**: Clean, elegant styling with serif fonts and gold/black accents

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Make sure your `.env` file contains:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
  ├── components/       # Reusable components
  │   ├── ProductCard.jsx
  │   └── ProductGrid.jsx
  ├── pages/           # Page components
  │   ├── HomePage.jsx
  │   └── ProductDetail.jsx
  ├── lib/             # Utilities and configurations
  │   ├── supabase.js  # Supabase client
  │   └── products.js   # Product data functions
  ├── App.jsx          # Main app component with routing
  ├── main.jsx         # Entry point
  └── index.css        # Global styles with Tailwind
```

## Database Schema

The application expects the following Supabase tables:

- **products**: Main product information
  - `id` (primary key)
  - `name`
  - `description`
  - `price`
  - `main_image_url` (path to image in productimages bucket)
  - `sku` (optional)
  - `created_at`

- **product_variants**: Product variants
  - `id` (primary key)
  - `product_id` (foreign key to products)
  - `name`
  - `description`
  - `price`
  - `created_at`

- **product_gallery**: Additional product images
  - `id` (primary key)
  - `product_id` (foreign key to products)
  - `image_url` (path to image in productimages bucket)
  - `created_at`

## Storage

Images are stored in the Supabase Storage bucket named `productimages`. The application automatically constructs public URLs for images stored in this bucket.


