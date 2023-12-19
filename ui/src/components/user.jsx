import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import Axios from "axios";
import UserContext from "../contexts/userContext";

export default function User() {
  const { isLogged, setIsLogged } = useContext(UserContext);
  const [response, setResponse] = useState({});
  const [boardlist, setBoardlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await Axios.get("http://localhost:8000/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .catch((error) => {
            console.log(error);
            localStorage.removeItem("token");
            navigate("/login");
          });
        setResponse(response.data);
        setBoardlist(response.data.boards);
      } else {
        navigate("/login");
      }
    }
    fetchData();
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem("token");
    setIsLogged(false);
    navigate("/login");
  };

  return (
    <>
      <div>You are now logged in</div>
      <div>{response.details?.username}</div>
      <button onClick={logoutHandler}>Log Out</button>
      <br></br>
      <br></br>
      <div>Boards</div>
      <br></br>
      <div>
        {boardlist.map((board) => (
          <div key={board[0]}>
            <Link to={`/boards/${board[0]}`}>{board[1]}</Link>
            <br></br>
          </div>
        ))}
      </div>
    </>
  );
}
