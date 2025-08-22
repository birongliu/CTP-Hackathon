# Backend - Interview AI Application

This is the backend service for the Interview AI application, built with Flask and LangGraph, integrating OpenAI and Supabase.

## Prerequisites

- Python 3.9+ (3.12 recommended)
- Docker and Docker Compose (optional, for containerized deployment)
- Supabase account (for database and authentication)
- OpenAI or Groq API key

## Environment Setup

1. Create a `.env` file in the backend directory with the following variables:

```
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key  # Optional if using Groq
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

## Installation

### Option 1: Local Installation

1. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install the required packages:

```bash
pip install -r requirements.txt
```

3. Run the Flask application:

```bash
python app.py
```

The backend will be available at `http://127.0.0.1:5000`.

### Option 2: Docker Installation

1. Build and start the Docker container:

```bash
docker-compose up --build
```

The backend will be available at `http://127.0.0.1:5000`.

## API Endpoints

- Authentication:
  - `/api/auth/signup` - Register a new user
  - `/api/auth/login` - Log in an existing user

- Interview:
  - `/api/interview/start` - Start a new interview session
  - `/api/interview/message` - Send a message to the interview
  - Additional endpoints documented in the routes directory

## Project Structure

- `app.py` - Main application entry point
- `agents/` - LangGraph agents and functions
- `db/` - Database models and Supabase integration
- `routes/` - API route definitions
- `services/` - Service layer for authentication and business logic

## Development

The application runs in debug mode by default, which enables hot reloading for code changes.

To enable detailed logging, modify the log level in `app.py`.
