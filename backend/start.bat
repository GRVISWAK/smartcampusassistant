@echo off
cd /d D:\studypilot\backend
D:\studypilot\backend\venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000
