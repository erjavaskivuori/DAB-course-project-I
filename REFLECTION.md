# Key design decisions

## Caching

Requests to the database are cached when meaningful. For this purpose I chose Redis because it was familiar from the course and fitted this purpose well.

## Submission queue and load balancing

For load balancing I decided to use Redis Streams as suggested. With Redis Streams it was also convinient to implement the queueing. 

## UI

The UI is reactive and can be used on smaller screens also. The theme is dark so it is comfortable to use. There is progress bar that visualizes user's progress.

To improve the user experience, the past submissions could be shown.

## Improving performance

As presented in the [performance test results](https://github.com/erjavaskivuori/DAB-course-project-I/blob/main/PERFORMANCE_TEST_RESULTS.md), there could be some enhancements done to improve the performance when loading the assignment page. Currently all of the assignments and user's solved assignments are fetched from the server and the next assignment is determined in the frontend. This is not ideal and causes overhead. To improve the performance, there could be one API to replace the current solution.

The performance in submitting assignments is already really good and there isn't really ways to improve it while taking the current requirements in account.
