import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import Axios from "axios";
import UserContext from "../contexts/userContext";

export default function User() {
  const { isLogged, setIsLogged } = useContext(UserContext);
  const [response, setResponse] = useState({});
  const [boardlist, setBoardlist] = useState([]);
  const [newBoardName, setNewBoardName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await Axios.get(`${import.meta.env.VITE_API_URL}/users/me`, {
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
    navigate("/");
  };

  const handleNewBoardNameChange = (event) => {
    setNewBoardName(event.target.value);
  };

  const handleNewBoardAdd = () => {
    const token = localStorage.getItem("token");
    if (token) {
      Axios.post(
        `${import.meta.env.VITE_API_URL}/boards`,
        {
          title: newBoardName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((response) => {
          navigate(`/boards/${response.data.id}`);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 to-orange-300 text-gray-800">
      <div className="bg-white p-8 rounded-md shadow-md text-center">
        <div className="text-3xl font-semibold mb-4">Welcome, {response.details?.username}!</div>
        <div className="flex items-center justify-center mb-6">
          <button
            onClick={logoutHandler}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none"
          >
            Log Out
          </button>
        </div>
        <div className="bg-blue-200 p-6 rounded-md mb-6">
          <div className="text-xl mb-2">Boards</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boardlist.map((board) => (
              <div key={board[0]} className="bg-white p-4 rounded-md shadow-md">
                <Link to={`/boards/${board[0]}`} className="text-blue-500 font-semibold">
                  {board[1]}
                </Link>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8">
          <div className="text-xl mb-2">Add New Board</div>
          <div className="flex items-center justify-center">
            <input
              type="text"
              name="newBoard"
              placeholder="New Board Name"
              value={newBoardName}
              onChange={handleNewBoardNameChange}
              className="mr-4 p-2 border rounded-md focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleNewBoardAdd}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none"
            >
              Add Board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
