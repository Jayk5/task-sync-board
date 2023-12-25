import { useContext } from 'react';
import { Link } from 'react-router-dom';
import UserContext from '../contexts/userContext';

export default function Home() {
  const { isLogged } = useContext(UserContext);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 to-orange-300 text-gray-800">
      <div className="bg-white p-8 rounded-md shadow-md mb-4 mt-4 w-full md:w-3/4 lg:w-2/3 xl:w-3/5 text-center">
        <h1 className="text-3xl font-semibold mb-4">Welcome to TaskSync</h1>
        <p className="text-lg mb-6">
          TaskSync is a collaborative project management application that allows users to create and manage boards in real-time. Whether you're working on a team project or organizing your personal tasks, TaskSync provides a seamless and efficient way to collaborate with others.
        </p>
        {isLogged ? (
          <div className="flex justify-center mb-4">
            <Link to="/user" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mr-4">
              Go to User Dashboard
            </Link>
          </div>
        ) : (
          <div className="flex justify-center mb-4">
            <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mr-4">
              Log In
            </Link>
            <Link to="/register" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Project Details Box */}
      <div className="bg-white p-8 rounded-md shadow-md mb-4 w-full md:w-3/4 lg:w-2/3 xl:w-3/5 text-center">
        <h2 className="text-2xl font-semibold mb-4">Project Details</h2>
        <p className="text-lg mb-6">
          TaskSync uses a FastAPI backend with a SQLite3 database, ensuring a lightweight and efficient data management system. Authentication is implemented using JSON Web Tokens (JWT), providing secure user access to the application.
        </p>
        <p className="text-lg mb-6">
          The frontend is built with ReactJS, and Tailwind CSS is used for styling, creating a modern and responsive user interface. The integration of WebSockets enables real-time collaboration, allowing users to see updates and changes instantly as they occur.
        </p>
        <a
          href="https://github.com/Jayk5/task-sync-board"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          View GitHub Repository
        </a>
      </div>
    </div>
  );
}
