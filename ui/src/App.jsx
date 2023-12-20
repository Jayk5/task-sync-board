import './index.css'
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Axios from 'axios'
import Login from './components/login'
import Register from './components/register'
import User from './components/user'
import Board from './components/board'
import UserContext from './contexts/userContext'

function App() {
  const userToken = localStorage.getItem('token')
  const [isLogged, setIsLogged] = useState(false);

  const validateToken = async () => {
    if (userToken) {
      try {
        const response = await Axios.post('http://localhost:8000/validate', {}, {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        })
        if (response.status === 200) {
          setIsLogged(true)
        } else {
          setIsLogged(false)
          localStorage.removeItem('token')
        }
      } catch (error) {
        console.log(error)
        setIsLogged(false)
      }
    } else {
      setIsLogged(false)
    }
  }

  useEffect(() => {
    const fetchToken = async () => {
      await validateToken()
    }
    fetchToken()
  }, [])

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
