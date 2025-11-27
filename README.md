# Menu System technical test

Aplikasi full-stack untuk manajemen menu hierarkis (Backend: NestJS, Database: MySQL, Frontend: React + Vite + TypeScript).

## Persyaratan
- Node.js >= 16
- npm 
- Docker & Docker Compose

## Setup
1. Clone repository:
   git clone <repo-url>
2. Install dependency:
   - Backend:
     cd backend && npm install
   - Frontend:
     cd frontend && npm install
3. Buat file `.env` di root (contoh variabel yang diperlukan):
   - DB_USERNAME
   - DB_PASSWORD
   - DB_DATABASE
   - BACKEND_PORT
   - FRONTEND_PORT

## Menjalankan di mode development
- Backend:
  cd backend
  npm run start:dev
- Frontend:
  cd frontend
  npm run dev

Akses frontend di http://localhost:<FRONTEND_PORT> (atau port yang ada di .env). API backend di http://localhost:<BACKEND_PORT>.

## Menjalankan di mode produksi
- Backend:
  cd backend
  npm run build
  npm run start:prod
- Frontend:
  cd frontend
  npm run build
  Serve folder `dist` (contoh: npx serve -s dist)

## Menjalankan dengan Docker Compose
- Pastikan `.env` terisi.
- Jalankan dari root project (Windows PowerShell/CMD):
  docker-compose up --build -d
- Layanan yang dibuat: mysql, backend, frontend
- Volume DB: `mysql_data`

## Dokumentasi API / Swagger
Swagger UI tersedia di:
http://localhost:3000/api/docs#/

(Jika BACKEND_PORT atau path berbeda, sesuaikan berdasarkan konfigurasi `.env` dan `backend/src/main.ts`.)

## Endpoints utama (ringkasan)
- GET /menus
- GET /menus/:id
- POST /menus
- PUT /menus/:id
- DELETE /menus/:id
- PATCH /menus/:id/move
- PATCH /menus/:id/reorder

Lihat controller di: `backend/src/menus/menus.controller.ts`. Frontend memanggil API lewat: `frontend/src/services/MenuService.ts`.

## Database
- Schema awal: `database/schema.sql`
- MySQL container default internal port: 3306 (dipetakan sesuai `docker-compose.yml`)

## Teknologi & keputusan arsitektur
- Backend: NestJS (struktur modular, TypeScript)
- Database: MySQL (persisted volume untuk data)
- Frontend: React + Vite + TypeScript + Tailwind (komponen terpisah + hook)
- Orkestrasi lokal: Docker Compose (memudahkan setup DB + backend + frontend)
- Tersedia mode demo/fallback di `frontend/src/services/MenuService.ts` bila backend tidak tersedia.

## Catatan singkat
- Periksa `.env` untuk menyesuaikan port dan kredensial DB.
- Jika Swagger tidak muncul, pastikan backend berjalan dan periksa path di `backend/src/main.ts`.
