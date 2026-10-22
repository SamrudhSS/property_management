@echo off
title IRA Real Estate Property Management & CRM
echo ========================================================
echo   IRA Real Estate Property Management & CRM System
echo   Excel Database: data/real_estate_database.xlsx
echo ========================================================
echo.
echo Starting Application Server on http://localhost:8000 ...
start "" "http://localhost:8000"
python backend\run.py
pause
