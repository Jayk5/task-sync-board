import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './components/login'
import Register from './components/register'
import User from './components/user'
import Board from './components/board'
import UserContext from './contexts/userContext'

function App() {
  const user = localStorage.getItem('token') ? true : false;
  const [isLogged, setIsLogged] = useState(user);

  return (
    <>
      <UserContext.Provider value={{ isLogged, setIsLogged }}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/user" element={<User />} />
            <Route path="/boards/:id" element={<Board />} />
          </Routes>
        </Router>
      </UserContext.Provider>
    </>
  )
}

export default App
