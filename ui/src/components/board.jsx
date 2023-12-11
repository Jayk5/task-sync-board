import { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import Axios from "axios";
import UserContext from "../contexts/userContext";

export default function Board() {
  const { isLogged, setIsLogged } = useContext(UserContext);
  const [board, setBoard] = useState([]);
  const [heads, setHeads] = useState([]);
  // TODO - Fix this so each column's inputs are separate
  const [item, setItem] = useState({
    title: '',
    description: '',
  });
  const [newColumn, setNewColumn] = useState({
    title: '',
  });
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      if (token) {
        const serverResponse = await Axios.get(`http://localhost:8000/boards/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        let cols = serverResponse.data.columns;
        let sizeOfBoard = cols.length;
        let maxSizeOfCol = 0;
        for (let i = 0; i < sizeOfBoard; i++) {
          if (cols[i].items.length > maxSizeOfCol) {
            maxSizeOfCol = cols[i].items.length;
          }
        }
        let newBoard = [];
        let tempArr = []
        for (let i = 0; i < sizeOfBoard; i++) {
          let tempobj = {};
          tempobj["id"] = cols[i].id;
          tempobj["title"] = cols[i].title;
          tempobj["position"] = cols[i].position;
          tempArr.push(tempobj);
        }
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
      } else {
        navigate("/login");
      }
    }
    fetchData();
  }, []);

  const renderTable = (board) => {
    const rows = [];
    for (let i = 0; i < board.length; i++) {
      const row = board[i];
      const children = [];
      for (let j = 0; j < row.length; j++) {
        children.push(<td key={j}>{
          row[j] ? <>
            <Link to={`/items/${row[j].id}`}>{row[j].title}</Link>
            <br /> {row[j].description} <br />
            <button onClick={() => handleItemDelete(row[j].id)}>Delete</button> </> : ""
        }</td>);
      }
      rows.push(<tr key={i}>{children}</tr>);
    }
    return rows;
  }

  const handleItemAdd = (columnId) => {
    const { title, description } = item;
    Axios.post(`http://localhost:8000/boards/${id}/${columnId}`, {
      title,
      description,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => {
        setItem({
          title: '',
          description: '',
        });
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
      }
      );
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  };

  const handleItemDelete = (itemId) => {
    Axios.delete(`http://localhost:8000/item/${itemId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => {
        window.location.reload();
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
        window.location.reload();
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
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
      }
      );
  }


  return (
    <>
      <h1>Board</h1>
      <Link to='/user'>Back</Link>
      <br />
      <br />
      <br />
      <table border={1}>
        <thead>
          <tr>
            {heads.map((head) => (
              <th key={head.id}>{head.title}</th>
            ))}
            <th>
              <input
                type="text"
                name="title"
                placeholder="Enter title"
                value={newColumn.title}
                onChange={handleColumnAddChange}
              />
              <button onClick={handleColumnAdd}>Add Column</button>
            </th>
          </tr>
        </thead>
        <tbody>
          {renderTable(board)}
        </tbody>
        <tfoot>
          <tr>
            {heads.map((head) => (
              <>
                <th>
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter title"
                    // value={item.title}
                    onChange={handleItemChange}
                  />
                  <input
                    type="text"
                    name="description"
                    placeholder="Enter description"
                    // value={item.description}
                    onChange={handleItemChange}
                  />
                  <button onClick={() => { handleItemAdd(head.id) }}>Add Item</button>
                </th>
              </>
            ))}
          </tr>
          <tr>
            {heads.map((head) => (
              <th>
                <button onClick={() => { handleColumnDelete(head.id) }}>Delete Column</button>
              </th>
            ))}
          </tr>
        </tfoot>
      </table>
    </>
  );
}
