import './app.css'
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import Home from './components/Home'
import AddQuest from './components/AddQuest'
import QuestList from './components/Quests'
import Register from './components/Register'
import Login from './components/Login'

const App = () => {
  

  return (
    <Router>
      <div>
        <ul className="header">
          <li><NavLink to='/'>Home</NavLink></li>
          <li><NavLink to="/quests">Quests</NavLink></li>
          <li><NavLink to="/add">Add Quest</NavLink></li>
          <li><NavLink to='/register'>Register</NavLink></li>
          <li><NavLink to='/login'>Login</NavLink></li>
        </ul>
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="quests" element={<QuestList />} />
            <Route path="add" element={<AddQuest />} />
            <Route path='register' element={<Register />} />
            <Route path='login' element={<Login />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
