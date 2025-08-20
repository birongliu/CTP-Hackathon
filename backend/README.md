# Backend Flask Setup

This README provides instructions for setting up and running the backend server using Flask.

## Prerequisites

- Python 3.8+
- pip (Python package manager)

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/birongliu/CTP-Hackathon.git
   cd backend
   ```

2. **Create a virtual environment (recommended)**

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

1. **Set environment variables (optional)**

   ```bash
   export FLASK_APP=app.py
   export FLASK_ENV=development
   ```

2. **Start the Flask server**
   ```bash
   flask run
   ```
   The server will start at `http://127.0.0.1:5000/` by default.

## Project Structure

```
backend/
├── app.py
├── requirements.txt
├── venv/
└── ...
```

## Useful Commands

- Install new packages: `pip install <package>`
- Freeze dependencies: `pip freeze > requirements.txt`
- Deactivate virtual environment: `deactivate`

## Troubleshooting

- If you encounter issues with dependencies, try deleting `venv/` and recreating it.
- Ensure you are using the correct Python version.

## License

Specify your license here.

## Contact

Add contact information or links for support.
