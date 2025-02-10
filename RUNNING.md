# Instructions for running

Note that the grader-image has to be built first! It can be done with this command

```
cd grader-image && bash ./build.sh && cd ..
```

### Running the development configuration

```
docker compose up
```

### Running the production configuration

```
docker compose -f docker-compose.prod.yml up -d
```

## Testing

[Instructions for running E2E tests](https://github.com/erjavaskivuori/DAB-course-project-I/blob/main/e2e-playwright/README.md)

### Running K6 tests

Loading assignments:

```
k6 run k6/performance-test-assignment.js
```

Submitting assignment:

```
k6 run k6/performance-test-submission.js
```
