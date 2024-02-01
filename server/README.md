# Node + Backend Server

To start the client, the `.env` must first be created. The .env.example can be used for this.

The `docker-compose build` command must then be called within the client folder. Once the process is complete, the container with the Svelte client can be started with `docker-compose up`.

By default mongodb is running on port 27017 and the backend-server is reachable on port 4000 can then be called here.

---------------------------------------------------
# Environment variables:

#Backend Server
| Variable   | Description      | 
|----------|-------------|
| `BACKEND_SERVER_PORT` |Sets the port under which the backend server can be reached. Default: `BACKEND_SERVER_PORT=4000` |
| `BACKEND_FRONTEND_URL` |Sets the address and port at which the frontend server can be reached. Default `BACKEND_FRONTEND_URL=http://localhost:5173` <br><br>This value must be identical to the variables `VITE_BACKEND_ADDRESS` and `VITE_BACKEND_PORT` within the .env in the front end.    |
| `BACKEND_LOCATIONS_FILE=locations.yml` | Not relevant for Tech-Adventure. This stores all location-related data in connection with energy efficiency. (Can be viewed in locations.yml) Not relevant for Tech-Adventure |
| `BACKEND_PROTOCOLS_FOLDER_PATH=protocols` | Not relevant for Tech-Adventure. Stores a folder under which logs for temperature settings can be saved. |
| `BACKEND_JWT_SECRET` | Sets the secret Token for JWT |
| `BACKEND_CRONJOB_HOUR` | Not relevant for Tech-Adventure. Sets the time (24h format) in hours for the cron job at which the temperatures of the thermostats are to be set Default. `BACKEND_CRONJOB_HOUR=22` |
| `BACKEND_CRONJOB_DAY_OF_WEEK` | Not relevant for Tech-Adventure. Sets the days on which the cronjob should be executed. With Mon=1 and Sun=7. Default `BACKEND_CRONJOB_DAY_OF_WEEK=1,2,3,4,5,6,7` |

#MongoDB Container
| Variable   | Description      | 
| -------- | ------- |
| `MONGODB_USERNAME`  | Sets the username for MongoDb    |
| `MONGODB_PASSWORD` | Sets the password for MongoDb    |
| `MONGODB_ADDRESS`    | Sets the address at which MongoDb can be reached. By default `MONGODB_ADDRESS=localhost`. However, as this is within a Docker container, `host.docker.internal` must be entered here.    |
| `MONGODB_PORT` | Sets the port for MongoDb. Default `MONGODB_PORT=27017`    |
| `MONGODB_DATABASE` | Sets the name for the Database    |
---------------------------------------------------
# Database model schemes:
There are two model schemes.
| name   | Description      | 
| -------- | ------- |
| `locationmodels`  | Includes the structure of the rooms and the tables    |
| `tablereservationmodels` | Contains the bookings for the tables for stored dates    |
