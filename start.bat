@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo  Gaetin - skrip jalan lokal (dev)
echo  Prasyarat: Docker Desktop berjalan + Node.js 20+ terpasang
echo ============================================================

echo.
echo [1/5] Menyalakan PostgreSQL (Docker)...
docker start gaetin-db 1>nul 2>nul || docker run -d --name gaetin-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=gaetin -p 5434:5432 postgres:16-alpine

echo [2/5] Menyalakan Redis (Docker)...
docker start gaetin-redis 1>nul 2>nul || docker run -d --name gaetin-redis -p 6379:6379 redis:7-alpine

echo [3/5] Install dependency (npm install)...
call npm install
if errorlevel 1 ( echo GAGAL: npm install & pause & exit /b 1 )

echo [4/5] Migrasi database + seed data demo...
call npx prisma migrate dev --name init
if errorlevel 1 ( echo GAGAL: prisma migrate & pause & exit /b 1 )
call npm run db:seed

echo [5/5] Menjalankan dev server...
echo.
echo  Buka  http://localhost:3000
echo  Login demo: demo@nusantara.test / Demo1234
echo.
call npm run dev

pause
