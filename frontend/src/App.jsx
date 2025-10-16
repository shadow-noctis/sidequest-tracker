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
import EditAchievement from './components/edit/EditAchievements';
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
        <div id='menu' className='bg-surface text-text px-6 py-4 shadow-lg drop-shadow-[0_0_15px_rgba(62,23,145,0.6)]'>
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <ul className="flex justify-between items-center max-w-5xl mx-auto">
                <li><NavLink to='/' className="px-4 hover:text-accent transition-colors">Home</NavLink></li>
                <li><NavLink to="/games(quest)" className="px-4 hover:text-accent">Quests</NavLink></li>
                <li><NavLink to="/games(achievement)" className="px-4 hover:text-accent">Achievements</NavLink></li>
                {user?.role === 'admin' && (<li><NavLink to="/add" className="hover:text-accent px-4">Add Quest</NavLink></li>)}
                {user?.role === 'admin' && (<li><NavLink to="/game-setup" className="hover:text-accent px-4">Game Setup</NavLink></li>)}
            </ul>
                
              <div className='flex items-center'>
                <ul>
                  {!user ? (
                    <li><NavLink to='/login' className="relative px-4 py-2 rounded-lg font-medium text-text  bg-gradient-to-tl from-accent to-background/70
                      shadow-[0_0_12px_rgba(142,124,195,0.5)] hover:shadow-[0_0_20px_rgba(217,179,255,0.8)] hover:brightness-110 transition-all duration-500 ease-in-out">Login</NavLink></li>
                  ) : (
                    <li className="relative px-4 py-2 rounded-lg font-medium text-accentAlt bg-surface border border-accent/50 shadow-[0_0_10px_rgba(142,124,195,0.3)]
                      hover:shadow-[0_0_18px_rgba(217,179,255,0.7)] hover:text-text transition-all duration-300"><LogoutButton /></li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="games(quest)" element={<GamesList />} />
              <Route path="games(achievement)" element={<GamesAchievement />} />
              <Route path="games/:gameId/quests" element={<QuestList />} />
              <Route path="games/:gameId/achievements" element={<AchievementsList />} />
              <Route path="quests/:questId" element={<EditQuest />} />
              <Route path="games/:gameId" element={<EditGame />} />
              <Route path="achievements/:achievementId" element={<EditAchievement />} />
              <Route path="versions/:versionId" element={<EditVersion />} />
              <Route path="add" element={<AddQuest />} />
              <Route path='register' element={<Register />} />
              <Route path='login' element={<Login />} />
              <Route path='game-setup' element={<GameSetup />} />
            </Routes>
          </div>
      </Router>
    </>
  );
}