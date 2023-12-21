import { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import Axios from "axios";
import UserContext from "../contexts/userContext";

export default function Board() {
  const { isLogged, setIsLogged } = useContext(UserContext);
  const [title, setTitle] = useState('');
  const [board, setBoard] = useState([]);
  const [heads, setHeads] = useState([]);
  const [item, setItem] = useState({});
  const [newColumn, setNewColumn] = useState({
    title: '',
  });
  const navigate = useNavigate();
  const { id } = useParams();

  async function fetchData() {
    try {
      const serverResponse = await Axios.get(`http://localhost:8000/boards/${id}`);
      let cols = serverResponse.data.columns;
      setTitle(serverResponse.data.board.title);
      let sizeOfBoard = cols.length;
      let maxSizeOfCol = 0;
      for (let i = 0; i < sizeOfBoard; i++) {
        if (cols[i].items.length > maxSizeOfCol) {
          maxSizeOfCol = cols[i].items.length;
        }
      }
      let newBoard = [];
      let tempArr = []
      let tempInputState = {};
      for (let i = 0; i < sizeOfBoard; i++) {
        let tempobj = {};
        tempobj["id"] = cols[i].id;
        tempobj["title"] = cols[i].title;
        tempobj["position"] = cols[i].position;
        tempInputState[cols[i].id] = {
          title: '',
          description: '',
        };
        tempArr.push(tempobj);
      }
      setItem(tempInputState);
      setHeads(tempArr);
      for (let i = 0; i < maxSizeOfCol; i++) {
        let tempArr = []
        for (let j = 0; j < sizeOfBoard; j++) {
          if (cols[j].items[i]) {
            cols[j].items[i]["columnId"] = cols[j].id;
            tempArr.push(cols[j].items[i]);
          } else {
            tempArr.push("");
          }
        }
        newBoard.push(tempArr);
      }
      setBoard(newBoard);
    }
    catch (error) {
      console.log(error);
      navigate("/");
    }
  }

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:8000/ws/boards/${id}`);
    console.log(socket);
    socket.addEventListener('open', function (event) {
      console.log('Connected to WS Server');
      fetchData();
    });
    socket.addEventListener('message', function (event) {
      const data = JSON.parse(event.data);
      console.log(data);
      if (data.type === 'update') {
        fetchData();
      }
    });
    socket.addEventListener('close', function (event) {
      console.log('Disconnected from WS Server');
    });
  }, []);

  const renderTable = (board) => {
    const rows = [];
    for (let i = 0; i < board.length; i++) {
      const row = board[i];
      const children = [];
      for (let j = 0; j < row.length; j++) {
        children.push(
          <td key={j} className="p-2 border border-blue-500 text-center rounded-md">
            {row[j] ? (
              <>
                <Link to={`/items/${row[j].id}`} className="text-blue-500 font-semibold block">
                  {row[j].title}
                </Link>
                <span className="block mb-2">{row[j].description}</span>
                {isLogged && (
                  <button
                    onClick={() => handleItemDelete(row[j].id)}
                    className="bg-red-400 text-white px-2 py-1 rounded-md hover:bg-red-600 focus:outline-none"
                  >
                    Delete
                  </button>
                )}
              </>
            ) : (
              ""
            )}
          </td>
        );
      }
      rows.push(<tr key={i}>{children}</tr>);
    }
    return rows;
  };

  const handleItemAdd = (columnId) => {
    const { title, description } = item[columnId];
    Axios.post(`http://localhost:8000/boards/${id}/${columnId}`, {
      title,
      description,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => {
        setItem((prevItem) => ({
          ...prevItem,
          [columnId]: {
            title: '',
            description: '',
          }
        }));
        // fetchData();
      })
      .catch((error) => {
        console.log(error);
      }
      );
  };

  const handleItemChange = (e, colId) => {
    const { name, value } = e.target;
    const columnId = colId;
    setItem((prevItem) => ({
      ...prevItem,
      [columnId]: {
        ...prevItem[columnId],
        [name]: value,
      }
    }));
  };

  const handleItemDelete = (itemId) => {
    Axios.delete(`http://localhost:8000/item/${itemId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => {
        // fetchData();
      })
      .catch((error) => {
        console.log(error);
      }
      );
  }

  const handleColumnAddChange = (e) => {
    const { name, value } = e.target;
    setNewColumn((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  }

  const handleColumnAdd = () => {
    Axios.post(`http://localhost:8000/boards/addcol/${id}`, {
      title: newColumn.title
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => {
        setNewColumn({
          title: '',
        });
        // fetchData();
      })
      .catch((error) => {
        console.log(error);
      }
      );
  }

  const handleColumnDelete = (columnId) => {
    Axios.delete(`http://localhost:8000/boards/delcol/${columnId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => {
        // fetchData();
      })
      .catch((error) => {
        console.log(error);
      }
      );
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 to-orange-300 text-gray-800">
      <div className="bg-white p-4 md:p-8 rounded-md shadow-md mb-4 mt-4 w-full md:w-3/4 lg:w-2/3 xl:w-4/5">
        <h1 className="text-2xl md:text-3xl font-semibold mb-4">Board - {title}</h1>
        <Link to='/user' className="text-blue-500 mb-2 block">Back</Link>

        <div className="overflow-x-auto">
          <table className="border-collapse border w-full">
            <thead>
              <tr>
                {heads.map((head) => (
                  <th key={head.id} className="p-2 border text-center bg-blue-500 text-white rounded-md shadow-md">
                    {head.title}
                  </th>
                ))}
                {isLogged && (
                  <th className="p-2 border text-center rounded-md">
                    <div className="mb-2">
                      <input
                        type="text"
                        name="title"
                        placeholder="Enter title"
                        value={newColumn.title}
                        onChange={handleColumnAddChange}
                        className="p-1 border rounded-md focus:outline-none focus:border-blue-500 shadow-md w-full"
                      />
                    </div>
                    <div>
                      <button
                        onClick={handleColumnAdd}
                        className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 focus:outline-none shadow-md w-full"
                      >
                        Add Column
                      </button>
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {renderTable(board)}
            </tbody>
            {isLogged && (
              <tfoot>
                <tr>
                  {heads.map((head) => (
                    <th key={head.id} className="p-2 border text-center rounded-md">
                      <input
                        type="text"
                        name="title"
                        placeholder="Enter title"
                        value={item[head.id].title}
                        onChange={(e) => { handleItemChange(e, head.id) }}
                        className="p-1 border rounded-md focus:outline-none focus:border-blue-500 shadow-md w-full"
                      />
                      <br />
                      <input
                        type="text"
                        name="description"
                        placeholder="Enter description"
                        value={item[head.id].description}
                        onChange={(e) => { handleItemChange(e, head.id) }}
                        className="p-1 border rounded-md focus:outline-none focus:border-blue-500 shadow-md w-full"
                      />
                      <br />
                      <button
                        onClick={() => { handleItemAdd(head.id) }}
                        className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 focus:outline-none shadow-md w-full"
                      >
                        Add Item
                      </button>
                    </th>
                  ))}
                </tr>
                <tr>
                  {heads.map((head) => (
                    <th key={head.id} className="p-2 border text-center rounded-md">
                      <button
                        onClick={() => { handleColumnDelete(head.id) }}
                        className="bg-red-400 text-white px-2 py-1 rounded-md hover:bg-red-600 focus:outline-none shadow-md w-full"
                      >
                        Delete Column
                      </button>
                    </th>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
