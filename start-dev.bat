@echo off
echo Starting Shoe Store Development Environment...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo Docker is running. Starting containers...
docker-compose up -d

echo.
echo Development environment is starting up!
echo.
echo Services will be available at:
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:5000
echo - phpMyAdmin: http://localhost:8080
echo - MySQL: localhost:3307
echo.
echo Press any key to view logs...
pause >nul

docker-compose logs -f