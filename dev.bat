@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

set "NPM_EXE=%ProgramFiles%\nodejs\npm.cmd"
if not exist "%NPM_EXE%" set "NPM_EXE=npm.cmd"

echo [INFO] Installing root dependencies...
call "%NPM_EXE%" install || exit /b 1

echo [INFO] Installing backend dependencies...
call "%NPM_EXE%" --prefix backend install || exit /b 1

echo [INFO] Installing frontend dependencies...
call "%NPM_EXE%" --prefix frontend install || exit /b 1

rem Build frontend if missing build output so UI renders statically
if not exist "frontend\build\index.html" (
  echo [INFO] Building frontend (first run)...
  call "%NPM_EXE%" --prefix frontend run build || exit /b 1
)

echo [INFO] Starting frontend and backend (dev) ...
call "%NPM_EXE%" run dev:all
