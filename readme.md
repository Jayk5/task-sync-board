## Task Sync Board

TaskSync is a collaborative project management application that allows users to create and manage boards in real-time.

Live deployed at - [https://task-sync-board.vercel.app/](https://task-sync-board.vercel.app/).
(However, the backend service is very slow because of free tier and often unreachable.)

TaskSync uses a FastAPI backend with a SQLite3 database, ensuring a lightweight and efficient data management system. Authentication is implemented using JSON Web Tokens (JWT), providing secure user access to the application.

The frontend is built with ReactJS, and Tailwind CSS is used for styling, creating a modern and responsive user interface. The integration of WebSockets enables real-time collaboration, allowing users to see updates and changes instantly as they occur.

## Local Setup

1. Clone the repository.
2. In root folder, run `pip install` to install the dependencies.
3. Run `uvicorn main: app --reload` to start the server.
4. In ui folder, run `npm install` to install the dependencies.
5. Create a `.env` file and copy contents of `.env_local` to `.env`.
6. Run `npm run dev` in ui folder to start the fontend client.
