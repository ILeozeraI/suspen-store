@echo off
title Suspen Store - site local (NAO FECHE ESTA JANELA)
cd /d "%~dp0"
where node >NUL 2>NUL || (echo Node.js nao encontrado. Instale em https://nodejs.org e rode de novo. & pause & exit /b)
if not exist node_modules (
  echo Instalando dependencias, so na primeira vez. Pode demorar alguns minutos...
  call npm install
)
if not exist .env.local copy .env.example .env.local >NUL
echo.
echo O navegador vai abrir sozinho quando o site estiver pronto.
echo Para desligar o site, feche esta janela.
echo.
start "" /min cmd /c "for /l %%i in (1,1,90) do (curl -s -o NUL http://localhost:3000 && (start http://localhost:3000 & exit) || timeout /t 2 >NUL)"
call npm run dev
pause
