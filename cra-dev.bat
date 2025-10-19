@echo off
setlocal
cd /d "%~dp0"

set "NPM_EXE=%ProgramFiles%\nodejs\npm.cmd"
if not exist "%NPM_EXE%" set "NPM_EXE=npm.cmd"

echo [INFO] Installing backend deps...
call "%NPM_EXE%" --prefix backend install || exit /b 1

echo [INFO] Installing frontend deps...
call "%NPM_EXE%" --prefix frontend install || exit /b 1

echo [INFO] Starting backend and CRA dev server...
call "%NPM_EXE%" run dev:cra

