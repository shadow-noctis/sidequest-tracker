import React, { useState, useEffect, useContext, useRef } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import DeleteModal from '../DeleteModal'
import ConfirmModal from '../ConfirmModal'
import EditAchievement from '../edit/EditAchievements';

function AchievementManager() {

    //User token
    const { user } = useContext(AuthContext)
    const token = localStorage.getItem('token');

    //Toast
    const navigate = useNavigate();
    const hasShown = useRef(false)
    const location = useLocation();

    const [achievements, setAchievements] = useState([]);
    const [allPlatforms, setAllPlatforms] = useState([]);
    const [games, setGames] = useState([])

    // Achievement values
    const initialForm = {
        name: "",
        description: "",
        warning: "",
        requires: "",
        gameId: null,
        platforms: []
    }
    const [achievementForm, setAchievementForm] = useState(initialForm)

    // Selected for delete
    const [selectedDelete, setSelectedDelete] = useState(null)

    // Delete warning
    const [confirmModal, setConfirmModal] = useState(false);


    // Add new Achievement
    const addAchievement = async (e) => {
        e.preventDefault();
        if (!achievementForm.platforms || achievementForm.platforms.length === 0) {
            alert("Please select at least one platform")
            return;
        }
        try{
            const res = await fetch('http://localhost:3001/api/achievements', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(achievementForm),
            });

            if (!res.ok) {
                throw new Error(`Server error ${res.status}`)
            }
            const data = await res.json();
            console.log('Achievement added:', data);
            toast(`Achievement "${achievementForm.name}" added`);
            fetchAchievements();
            resetForm();

        } catch (err) {
            console.error('Failed to add achievement', err)
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setAchievementForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setAchievementForm(initialForm)
        };

    
    const handleChecked = (e) => {
        const { name, value, checked } = e.target;
        const id = Number(value);

        setAchievementForm((prev) => {
            if (checked) {
            return {
                ...prev,
                [name]: [...prev[name], id]
            };
            } else {
            return {
                ...prev,
                [name]: prev[name].filter((p) => p !== id)
            };
            }
        });
    };

    // Get existing games
    const fetchAchievements = () => {
        const res =  fetch('http://localhost:3001/api/achievements')
        .then(res => res.json())
        .then(data => {
            console.log("Achievements: ", data)
            setAchievements(data)
        });
    };

    const fetchGames = () => {
        const gameres =  fetch('http://localhost:3001/api/games')
        .then(gameres => gameres.json())
        .then(data => {
            setGames(data)
        });
    };

    // Get all platforms
    const fetchPlatforms = () => {
        const res = fetch('http://localhost:3001/api/platforms')
        .then(res => res.json())
        .then(data => {
            setAllPlatforms(data)
        });
    };

    // Get existing games
    useEffect(() => {
        fetchGames();
        fetchAchievements();
        fetchPlatforms();
    }, [])

    return (
        <div id="achievement-manager" className="px-8 py-6 text-text">
          <h2 className="text-4xl font-bold text-accent mb-6 text-center">
            Achievements
          </h2>
    
          {/* Existing achievements */}
          <section className="mb-8">
            <h3 className="text-2xl text-accentAlt font-semibold mb-4">
              Existing Achievements
            </h3>
            <ul className="space-y-2">
              {achievements.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between bg-surface px-4 py-2 rounded-xl border border-accent/30 shadow-md hover:bg-accent/10 transition"
                >
                  <span className="text-lg">{a.name}</span>
                  {user?.role === 'admin' && (
                    <Link
                      to={`/achievements/${a.id}`}
                      className="text-accentAlt hover:text-accent font-medium"
                    >
                      Edit
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
    
          {/* Add Achievement Form */}
          <section className="bg-surface p-6 rounded-2xl shadow-xl">
            <h3 className="text-2xl text-accentAlt font-semibold mb-4">
              Add Achievement
            </h3>
    
            <form
              onSubmit={addAchievement}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Left column */}
              <div className="space-y-3">
                <label className="block">
                  <span className="text-muted">Name</span>
                  <input
                    name="name"
                    placeholder="Name"
                    value={achievementForm.name}
                    onChange={handleChange}
                    className="w-full bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition"
                  />
                </label>
    
                <label className="block">
                  <span className="text-muted">Requires</span>
                  <input
                    name="requires"
                    placeholder="Requires"
                    value={achievementForm.requires}
                    onChange={handleChange}
                    className="w-full bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition"
                  />
                </label>
    
                <label className="block">
                  <span className="text-muted">Description</span>
                  <input
                    name="description"
                    placeholder="Description"
                    value={achievementForm.description}
                    onChange={handleChange}
                    className="w-full bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition"
                  />
                </label>
    
                <label className="block">
                  <span className="text-muted">Warning</span>
                  <input
                    name="warning"
                    placeholder="Warning"
                    value={achievementForm.warning}
                    onChange={handleChange}
                    className="w-full bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition"
                  />
                </label>
              </div>
    
              {/* Right column */}
              <div className="space-y-3">
                <label className="block">
                  <span className="text-muted">Game</span>
                  <select
                    name="gameId"
                    value={achievementForm.gameId || ''}
                    onChange={handleChange}
                    className="w-full bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition"
                  >
                    <option value="">-- Select a Game --</option>
                    {games.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </label>
    
                <div>
                  <span className="text-muted block mb-1">Platforms</span>
                  <ul className="grid gap-2">
                    {allPlatforms.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center bg-[#1a1633] px-3 py-2 rounded-lg hover:bg-accent/10"
                      >
                        <input
                          type="checkbox"
                          value={p.id}
                          name="platforms"
                          onChange={handleChecked}
                          checked={achievementForm.platforms.includes(p.id)}
                          className="mr-2 accent-accent"
                        />
                        <label>{p.name}</label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
    
              <div className="col-span-2 mt-4 text-center">
                <button
                  type="submit"
                  className="bg-accent hover:bg-accentAlt text-[#0d0b1e] font-semibold px-6 py-2 rounded-xl shadow-lg transition"
                >
                  Add Achievement
                </button>
              </div>
            </form>
          </section>
        </div>
      )
};
export default AchievementManager;