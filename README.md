Instructions for server and client can also be found separately in the folders

# Setting up the project: 
<details>
<summary>Client</summary>
<br>
  
# Svelte + TS + Vite

To start the server, the `.env` must first be created. The .env.example can be used for this.

The `docker-compose build` command must then be called within the client folder. Once the process is complete, the container with Svelte can be started with `docker-compose up`.

By default, http://localhost:5173 can then be called here.

---------------------------------------------------
# Environment variables:

#Frontend Server
| Variable   | Description      | 
|----------|-------------|
| `VITE_MSAL_CLIENT_REDIRECT_ADDRESS` |Sets the address to be forwarded to after authentication with MSAL. Default: `VITE_MSAL_CLIENT_REDIRECT_ADDRESS=http://localhost` |
| `VITE_MSAL_CLIENT_REDIRECT_PORT` |Sets the port of the address to which forwarding is to take place after authentication with MSAL `VITE_MSAL_CLIENT_REDIRECT_PORT=5173` Das ist der Port unter welchem der Frontend-Server zu erreichen ist. |
| `VITE_MSAL_CLIENT_ID` | The client ID of this project from Azure|
| `VITE_MSAL_AUTHORITY` | Authority URL for MS |
| `VITE_BACKEND_ADDRESS` | Sets the address at which the backend server can be reached. |
| `VITE_BACKEND_PORT` | Sets the port for the address at which the backend server can be reached. The port must match the one from the `BACKEND_SERVER_PORT` variable stored in .env in the server |
</details>


<details>
<summary>Server</summary>
<br>
  
# Backend Server (Node) + MongoDB

To start the server, the `.env` must first be created. The .env.example can be used for this.

The `docker-compose build` command must then be called within the client folder. Once the process is complete, the container with Svelte can be started with `docker-compose up`.

By default, http://localhost:5173 can then be called here.

---------------------------------------------------
# Environment variables:

#Frontend Server
| Variable   | Description      | 
|----------|-------------|
| `VITE_MSAL_CLIENT_REDIRECT_ADDRESS` |Sets the address to be forwarded to after authentication with MSAL. Default: `VITE_MSAL_CLIENT_REDIRECT_ADDRESS=http://localhost` |
| `VITE_MSAL_CLIENT_REDIRECT_PORT` |Sets the port of the address to which forwarding is to take place after authentication with MSAL `VITE_MSAL_CLIENT_REDIRECT_PORT=5173` Das ist der Port unter welchem der Frontend-Server zu erreichen ist. |
| `VITE_MSAL_CLIENT_ID` | The client ID of this project from Azure|
| `VITE_MSAL_AUTHORITY` | Authority URL for MS |
| `VITE_BACKEND_ADDRESS` | Sets the address at which the backend server can be reached. |
| `VITE_BACKEND_PORT` | Sets the port for the address at which the backend server can be reached. The port must match the one from the `BACKEND_SERVER_PORT` variable stored in .env in the server |
</details>
