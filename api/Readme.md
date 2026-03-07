# Axois and Axois Interperters

- `axois` is a library, which is used for handling api calls
- we had set up the Axios `Interceptor` in your `lib/` folder to handle automatic token refreshing whenever the backend sends a 401 error.
- It handles the silent logic of keeping the user logged in without them ever seeing a 401 error screen.
- In `Next 16`, because we are moving toward a stricter network boundary, your apiClient needs to be robust enough to handle `Concurrent Request Queuing`. If your Access Token expires while 5 chess-related requests are in flight, you don't want to trigger 5 refresh calls; you want to pause 4, refresh once, and then resume.

## The Logic of `Concurrent Request Queuing`

Imagine the user opens the Dashboard. Three requests fire: `getUser()`, `getFriends()`, and `getActiveGames()`.

Request 1 (`getUser`) hits a 401. It sets `isRefreshing = true` and calls the backend to refresh.

Request 2 & 3 also hit 401s while Request 1 is still waiting.

Because `isRefreshing` is true, Requests 2 and 3 are pushed into the `failedQueue` array as unresolved Promises.

Once the refresh succeeds, processQueue() is called, resolving those promises and letting Requests 2 and 3 fire again automatically.