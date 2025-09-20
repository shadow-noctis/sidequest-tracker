import React, { useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import {ToastContainer} from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "./components/AuthContext";
import Home from './components/Home'
import AddQuest from './components/AddQuest'
import QuestList from './components/Quests'
import Register from './components/Register'
import Login from './components/Login'
import LogoutButton from './components/Logout';
import GamesList from './components/Games'
import EditQuest from './components/edit/EditQuest'
import GameSetup from './components/GameSetup';
import EditGame from './components/edit/EditGame';
import EditVersion from './components/edit/EditVersion';
import GamesAchievement from './components/GamesAchievement';
import AchievementsList from './components/Achievements';

export default function App() {

  const { user } = useContext(AuthContext)

  return (
    <>
    <ToastContainer 
        position="bottom-right"
        autoClose={3000}   // 3 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
      />
      <Router>
        <div>
          <ul className="header">
            <li><NavLink to='/'>Home</NavLink></li>
            <li><NavLink to="/games(quest)">Quests</NavLink></li>
            <li><NavLink to="/games(achievement)">Achievements</NavLink></li>
            {user?.role === 'admin' && (<li><NavLink to="/add">Add Quest</NavLink></li>)}
            {user?.role === 'admin' && (<li><NavLink to="/game-setup">Game Setup</NavLink></li>)}
            {!user ? (
            <>
              <li><NavLink to='/login'>Login</NavLink></li>
            </>
            ) : (
              <li><LogoutButton /></li>
            )}

          </ul>
          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="games(quest)" element={<GamesList />} />
              <Route path="games(achievement)" element={<GamesAchievement />} />
              <Route path="games/:gameId/quests" element={<QuestList />} />
              <Route path="games/:gameId/achievements" element={<AchievementsList />} />
              <Route path="quests/:questId" element={<EditQuest />} />
              <Route path="games/:gameId" element={<EditGame />} />
              <Route path="versions/:versionId" element={<EditVersion />} />
              <Route path="add" element={<AddQuest />} />
              <Route path='register' element={<Register />} />
              <Route path='login' element={<Login />} />
              <Route path='game-setup' element={<GameSetup />} />
            </Routes>
          </div>
        </div>
      </Router>
    </>
  );
}