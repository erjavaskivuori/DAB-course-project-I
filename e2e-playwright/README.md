# Running end to end tests

Run the E2E tests with the following command.

1. Start the services with the following command:

```
docker compose up -d
```

This command starts all the services defined in  `docker-compose.yml` file in detached mode.

2. Run the E2E tests with the following command:

```
docker compose run --entrypoint=npx e2e-playwright playwright test
```


This command runs the tests in a separate container, which can interact with the services started in step 1.

3. After the tests are complete, you can stop the services with the following command:

```
docker compose down
```

This command stops and removes all the containers started by `docker compose up`.