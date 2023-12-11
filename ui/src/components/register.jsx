import { useState, useContext } from "react";
import Axios from "axios";
import UserContext from "../contexts/userContext";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { isLogged, setIsLogged } = useContext(UserContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim().length === 0) {
      setErrorMsg("Username cannot be empty");
      setError(true);
    } else if (password.trim().length === 0) {
      setErrorMsg("Password cannot be empty");
      setError(true);
    } else {
      Axios.post("http://localhost:8000/register", {
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
    <>
      {isLogged ? <div>You are already logged in</div> :
        <form>
          <div>
            <h3>Sign Up</h3>
            <div>
              <label>Username</label>
              <input
                type="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-control"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                placeholder="Enter password"
              />
            </div>
            {error ? <div>{errorMsg}</div> : ""}
            <div>
              <button
                type="submit"
                onClick={(e) => {
                  handleSubmit(e);
                }}
              >
                Sign Up
              </button>
            </div>
            <p>
              Already registered? <a href="/login">Log In</a>
            </p>
          </div>
        </form>
      }
    </>
  );
}
