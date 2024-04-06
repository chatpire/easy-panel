DB_CONTAINER_NAME="easy-panel-postgres"

if ! [ -x "$(command -v docker)" ]; then
  echo "Docker is not installed. Please install docker and try again.\nDocker install guide: https://docs.docker.com/engine/install/"
  exit 1
fi

if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
  docker start $DB_CONTAINER_NAME
  echo "Database container started"
  exit 0
fi

# import env variables from .env
set -a
source .env

if ! [ -f .env ]; then
  echo ".env file not found. Please create .env file and try again."
  exit 1
fi

docker run --name $DB_CONTAINER_NAME -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD -e POSTGRES_DB=$POSTGRES_DB -d -p $POSTGRES_PORT:$POSTGRES_PORT postgres:16

echo "Database container was successfully created"
