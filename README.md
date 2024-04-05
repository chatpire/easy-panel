## Deploy

### Docker Compose

```bash
docker compose build
docker compose run --rm cock-panel yarn docker:db-migrate
docker compose run --rm cock-panel yarn docker:create-admin
docker compose up -d
```
