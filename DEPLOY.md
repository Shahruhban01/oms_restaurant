# 🚀 Deployment Guide — DirectAdmin / Shared Hosting

## Prerequisites
- DirectAdmin shared hosting account
- MySQL database created via DirectAdmin
- FTP client (FileZilla recommended)
- Node.js locally for building frontend

---

## Step 1 — Database Setup
1. Log in to DirectAdmin → MySQL Manager
2. Create a new database: `restaurant_saas`
3. Create a database user with ALL PRIVILEGES on that database
4. Open phpMyAdmin → select the database
5. Import `backend/database/schema.sql`
6. Import `backend/database/seed.sql`

---

## Step 2 — Backend Deployment
1. Edit `backend/.env` with your actual values:
   - DB_HOST=localhost
   - DB_NAME=restaurant_saas
   - DB_USER=your_db_user
   - DB_PASS=your_db_password
   - JWT_SECRET=generate_64_char_random_string
   - SUPERADMIN_SETUP_KEY=your_secret_setup_key
   - CORS_ORIGIN=https://yourdomain.com
   - APP_ENV=production

2. Upload the entire `backend/` folder to your hosting root via FTP
   - If document root is `public_html/`, upload to `public_html/backend/`
   - The backend .htaccess in `backend/` blocks access to config/storage

3. Ensure `backend/storage/` directory is writable:
   - Set permissions to 755 via DirectAdmin File Manager

---

## Step 3 — Frontend Build
Run locally:
```bash
cd frontend
npm install
npm run build
