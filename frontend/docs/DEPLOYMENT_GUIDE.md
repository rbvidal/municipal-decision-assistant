# Deployment Guide

**Version:** 1.0-pilot
**Date:** 2026-07-17

---

## Architecture Overview

```
┌──────────────────────────────────────────┐
│              nginx (HTTPS)               │
│   Reverse Proxy + Static File Serving    │
└──────┬──────────────┬───────────────────┘
       │              │
       ▼              ▼
┌──────────────┐ ┌──────────────────────┐
│  Spring Boot  │ │   Frontend (Vite)    │
│  (port 8080)  │ │   Static Build       │
│               │ │   (/opt/app/static)   │
└──────┬───────┘ └──────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│           PostgreSQL :5432               │
│           Qdrant :6333                   │
│           Neo4j :7687                    │
└──────────────────────────────────────────┘
```

## Environment Configuration

### Development

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK_SERVICES=true
```

### Production

```bash
# .env.production
VITE_API_BASE_URL=https://api.verwaltungsportal.de
VITE_USE_MOCK_SERVICES=false
```

### Spring Boot Profiles

| Profile | Purpose |
|---|---|
| `dev` | Local development, H2 database, mock services |
| `test` | Integration tests, Testcontainers |
| `prod` | Production, PostgreSQL, real services |

## Docker Architecture

### Production Dockerfile (Frontend)

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Production Dockerfile (Backend)

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/platform-api-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### docker-compose.yml (Production)

```yaml
services:
  nginx:
    image: nginx:alpine
    ports: ["443:443"]
    volumes: [./nginx.conf:/etc/nginx/conf.d/default.conf, certs:/etc/nginx/certs]
    depends_on: [backend]
    
  backend:
    build: ./platform-api
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_URL=jdbc:postgresql://postgres:5432/verwaltungsportal
    depends_on: [postgres, qdrant, neo4j]
    
  postgres:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      - POSTGRES_DB=verwaltungsportal
    
  qdrant:
    image: qdrant/qdrant:latest
    volumes: [qdrant_data:/qdrant/storage]
    
  neo4j:
    image: neo4j:5-community
    volumes: [neo4j_data:/data]
```

## HTTPS Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name verwaltungsportal.de;
    
    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri /index.html;
    }
    
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Backup Strategy

### Database (PostgreSQL)
```bash
pg_dump -h localhost -U verwaltungsportal > backup_$(date +%Y%m%d).sql
```

### Vector Database (Qdrant)
- Qdrant snapshots: `POST /snapshots`
- Store in S3-compatible storage

### Knowledge Graph (Neo4j)
```bash
neo4j-admin backup --backup-dir=/backups
```

### Schedule
- **Daily:** PostgreSQL logical backup (retained 7 days)
- **Weekly:** Full backup (retained 4 weeks)
- **Monthly:** Archive backup (retained 12 months)

## Zero-Downtime Deployment

1. Deploy new version to staging
2. Run smoke tests
3. Add new instances to load balancer
4. Drain traffic from old instances (30s grace period)
5. Remove old instances
6. Monitor error rates for 5 minutes

## Environment Separation

| Environment | Purpose | Data |
|---|---|---|
| Development | Local development | Mock data |
| Staging | Pre-release testing | Anonymized production subset |
| Production | Live system | Real municipal data |

## Kubernetes Deployment (Future)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: backend
        image: verwaltungsportal/backend:v1.0
        resources:
          requests: { memory: "512Mi", cpu: "500m" }
          limits: { memory: "1Gi", cpu: "1000m" }
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource: { name: cpu, target: { averageUtilization: 70 } }
```
