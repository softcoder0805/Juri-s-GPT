@echo off
echo Setting up LawBot AI Backend...

cd backend

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing requirements...
pip install -r requirements.txt

echo Starting LawBot AI Backend...
python app.py

pause
