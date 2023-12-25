import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import UserContext from "../contexts/userContext";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { isLogged, setIsLogged } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim().length === 0) {
      setErrorMsg("Username cannot be empty");
      setError(true);
    } else if (password.trim().length === 0) {
      setErrorMsg("Password cannot be empty");
      setError(true);
    } else {
      Axios.post(`${import.meta.env.VITE_API_URL}/register`, {
        username,
        password,
      })
        .then((response) => {
          console.log(response);
          setError(false);
          localStorage.setItem("token", response.data.access_token);
          setIsLogged(true);
          navigate("/user");
        })
        .catch((error) => {
          console.log(error);
          setError(true);
          setErrorMsg("Some error happened");
        });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 to-orange-300 text-gray-800">
      {isLogged ? (
        <div className="bg-green-500 text-white p-8 rounded-md">
          You are already logged in
        </div>
      ) : (
        <form className="bg-white p-8 shadow-md rounded-md w-96">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">Sign Up</h3>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
              placeholder="Enter username"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
              placeholder="Enter password"
            />
          </div>
          {error && (
            <div className="text-red-500 mb-4">{errorMsg}</div>
          )}
          <div>
            <button
              type="submit"
              onClick={(e) => {
                handleSubmit(e);
              }}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none"
            >
              Sign Up
            </button>
          </div>
          <p className="text-gray-600 text-sm mt-4">
            Already registered? <a href="/login" className="text-blue-500">Log In</a>
          </p>
        </form>
      )}
    </div>
  );
}
