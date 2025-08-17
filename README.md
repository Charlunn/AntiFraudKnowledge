# AntiFraudKnowledge

A full‑stack learning platform that visualises anti‑fraud knowledge and simulates scam conversations. The project combines a **Django** backend, a **Nuxt 3** frontend and a **Neo4j** graph database, all orchestrated via **Docker Compose**.

## Directory structure

```
backend/   # Django services and API
frontend/  # Nuxt 3 client
```

## Tech stack
- Django & Django REST Framework
- Nuxt 3 (Vue 3)
- Neo4j
- Docker / Docker Compose

## Development

### With Docker

```bash
docker-compose up --build
```
This starts the backend, frontend and Neo4j services.

### Manual

**Backend**
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Visit <http://localhost:3000> for the frontend and <http://localhost:8000> for the Django API.

## License

MIT
