@echo off
setlocal
cd /d "%~dp0"

set "NPM_EXE=%ProgramFiles%\nodejs\npm.cmd"
if not exist "%NPM_EXE%" set "NPM_EXE=npm.cmd"
call "%NPM_EXE%" run dev
