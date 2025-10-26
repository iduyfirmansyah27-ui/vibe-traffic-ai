@echo off
echo [1/4] 🛠️  Memperbaiki izin folder...

:: Dapatkan path lengkap ke folder proyek
set "project_path=%~dp0"

:: Hentikan proses yang mungkin menggunakan file
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM cmd.exe >nul 2>&1

:: Berikan hak akses penuh ke folder proyek
echo [2/4] 🔑 Memberikan hak akses...
(
echo Set objShell = CreateObject("Shell.Application"^)
echo Set objFolder = objShell.Namespace("%project_path%"^)
echo Set objFolderItem = objFolder.Self
echo objFolderItem.InvokeVerb "runas"
) > "%temp%\getadmin.vbs"

"%temp%\getadmin.vbs"
del "%temp%\getadmin.vbs" >nul 2>&1

:: Bersihkan cache dan install ulang
echo [3/4] 🧹 Membersihkan dan menginstal ulang...
call npm cache clean --force
if exist node_modules rmdir /s /q node_modules
if exist .next rmdir /s /q .next
if exist .vercel rmdir /s /q .vercel
if exist package-lock.json del package-lock.json
if exist yarn.lock del yarn.lock
if exist pnpm-lock.yaml del pnpm-lock.yaml

:: Install dependencies
echo [4/4] 📦 Menginstal dependensi...
call npm install

:: Selesai
echo.
echo ✅ Proses perbaikan selesai!
echo Sekarang jalankan 'npm run build' untuk memastikan semuanya berfungsi
echo.
pause
