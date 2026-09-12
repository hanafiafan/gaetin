@echo off
setlocal
cd /d "%~dp0"
echo ============================================================
echo  Gaetin - menjalankan stack lokal melalui Docker Compose
echo  Prasyarat: Docker Desktop aktif dan file .env terkonfigurasi
 echo ============================================================
if not exist .env (
  echo Buat .env dari .env.example dan isi kredensial sebelum menjalankan.
  exit /b 1
)
docker compose up -d --build
if errorlevel 1 (
  echo GAGAL: periksa Docker Desktop dan konfigurasi .env.
  exit /b 1
)
echo App, worker, gateway, database, dan Caddy sudah dijalankan.
echo Buka domain yang diatur dalam .env. Lihat log: docker compose logs -f
