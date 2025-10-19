@echo off
setlocal
rem Make PowerShell use CMD shims for npm/npx by editing profile files directly.

set "NPMPATH=%ProgramFiles%\nodejs\npm.cmd"
set "NPXPATH=%ProgramFiles%\nodejs\npx.cmd"

set "PSDIR1=%USERPROFILE%\Documents\WindowsPowerShell"
set "PSFILE1=%PSDIR1%\Microsoft.PowerShell_profile.ps1"
set "PSDIR2=%USERPROFILE%\Documents\PowerShell"
set "PSFILE2=%PSDIR2%\Microsoft.PowerShell_profile.ps1"

for %%D in ("%PSDIR1%" "%PSDIR2%") do if not exist "%%~D" mkdir "%%~D" >nul 2>nul

for %%F in ("%PSFILE1%" "%PSFILE2%") do (
  if exist "%%~F" (
    findstr /C:"Set-Alias npm" "%%~F" >nul 2>nul || echo Set-Alias npm "%NPMPATH%">>"%%~F"
    findstr /C:"Set-Alias npx" "%%~F" >nul 2>nul || echo Set-Alias npx "%NPXPATH%">>"%%~F"
  ) else (
    (
      echo # Added by LibReport setup
      echo Set-Alias npm "%NPMPATH%"
      echo Set-Alias npx "%NPXPATH%"
    )>"%%~F"
  )
)

echo [OK] Aliases written. Close and reopen PowerShell and run: npm run dev:all
endlocal

