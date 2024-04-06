## Deploy

### Docker Compose

```bash
docker compose build
docker compose run --rm easy-panel yarn docker:db-migrate
docker compose run --rm easy-panel yarn docker:create-admin
docker compose up -d
```
