import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";
import DeleteModal from './DeleteModal'

function AchievementsList() {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [gameName, setGameName] = useState(location.state?.gameName);
  // Selected quest if delete, edit etc.
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [warningVisible, setWarningVisible] = useState({});
  
  const [expandedAchievements, setExpandedAchievements] = useState({});

  // Versions related to game and currently selected platform to show
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const { gameId } = useParams();
  const navigate = useNavigate();
  const hasShown = useRef(false)

  //user
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  const [allExpanded, setAllExpanded] = useState(false)

  
  
  // Expand or collapse info:
  const toggleQuest = (id) => {
    setExpandedAchievements((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Expand all achievements
  const expandAll = () => {
    const allExpanded = {};
    achievements.forEach((a) => (allExpanded[a.id] = true));
    setExpandedAchievements(allExpanded);
    setAllExpanded(true)
  }

  const collapseAll = () => {
    setExpandedAchievements({});
    setAllExpanded(false)
  };

  const toggleWarning = (id) => {
    setWarningVisible(prev => ({ 
        ...prev,
        [id]: !prev[id]
    }));
  };

  const handleClick = (e) => {
      const { value } = e.target;
      setSelectedPlatform(value);    
    }
  
  // Mark as achieved
  async function completeAchievement(achievementId, currentAchieved) {
    try {
      const res = await fetch(`http://localhost:3001/api/achievements/${achievementId}/achieved`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ achieved: !currentAchieved })
      });

      if (!res.ok) throw new Error('Failed to update achievement');

      // Refetch quests to update UI
      const achievementRes = await fetch('http://localhost:3001/api/achievements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    setAchievements(prev =>
      prev.map(a => a.id === achievementId ? { ...a, achieved: !currentAchieved } : a)
    );

    } catch (err) {
      console.error('Error completing quest:', err);
    }
  }

  // Fetch achievements
  useEffect(() => {
    fetch(`http://localhost:3001/api/games/${gameId}/achievements`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        console.log("Achievements: ", data);
        const sortedAchievements = data.sort((a, b) => a.name.localeCompare(b.name));
        setAchievements(sortedAchievements);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching achievements:', err);
        setLoading(false);
      });
  }, [gameId, token, showModal]);


  // Get platforms
  useEffect(() => {
    fetch(`http://localhost:3001/api/platforms/${gameId}`)
    .then(res => res.json())
    .then(data => {
      console.log("Platforms:", data)
      setSelectedPlatform(data[0].name)
      setPlatforms(data)
    })
    .catch(err => {
      console.error('Error retrieving platforms:', err);
      setLoading(false);
    })
  }, [])

  //Get game name if not set
  useEffect(() => {
   if (!gameName) {
    fetch(`http://localhost:3001/api/games/${gameId}/name`)
    .then(res => res.json())
    .then(data => {
      setGameName(data)
    })
    .catch(err => {
      console.error('Error getting game name:', err)
    })
   } 
  }, [])

  if (loading) return <p>Loading quests...</p>;

  return (
    <div className="px-10">
  
      {/* Platform Selector */}
      <div className="mx-auto mt-8 bg-surface/70 border border-accent/20 rounded-2xl shadow-lg shadow-accent/10 p-4">
      <h2 className="text-center text-3xl text-accent px-4 py-4">{gameName}</h2>
        <div className="flex justify-center gap-2 mb-4">
          {platforms.map(p => (
            <button
              key={p.id}
              name={p.id}
              value={p.name}
              onClick={handleClick}
              className={`
                flex-1 px-3 py-2 text-sm sm:text-base tracking-wide font-bold rounded-lg
                border transition-all duration-200
                ${selectedPlatform === p.name
                  ? 'bg-accentAlt text-background border-accentAlt shadow-lg shadow-accentAlt/30'
                  : 'bg-surface text-accent border-accent/30 hover:border-accent/80 hover:bg-accent/10'}
              `}
            >
              {p.name}
            </button>
          ))}
        </div>
  
        {/* Expand / Collapse Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={expandAll}
            className={`
              px-4 py-2 rounded-xl font-semibold transition
              ${allExpanded
                ? 'bg-accent/10 text-muted'
                : 'bg-accentAlt/20 hover:bg-accentAlt/30 text-accentAlt'}
            `}
            disabled={allExpanded}
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className={`
              px-4 py-2 rounded-xl font-semibold transition
              ${!allExpanded
                ? 'bg-accent/10 text-muted'
                : 'bg-accentAlt/20 hover:bg-accentAlt/30 text-accentAlt'}
            `}
            disabled={!allExpanded}
          >
            Collapse All
          </button>
        </div>
  
        {/* Achievements List */}
        <ul className="space-y-4">
        {achievements
          .filter(a => a.platforms.some(p => p.name === selectedPlatform))
          .map(a => {
            const isExpanded = expandedAchievements[a.id];
            return (
              <li
                key={a.id}
                className={`
                  border rounded-2xl shadow-md overflow-hidden transition-all duration-300
                  ${isExpanded
                    ? 'bg-accent/20 border-accentAlt shadow-accentAlt/30'
                    : 'bg-surface/90 border-accent/20 shadow-accent/10 hover:bg-accent/10'}
                `}
              >
                {/* Header */}
                <div
                  onClick={() => toggleQuest(a.id)}
                  className={`
                    flex justify-between items-center px-4 py-3 cursor-pointer
                    transition-all duration-300
                    ${isExpanded ? 'bg-accent/30' : ''}
                  `}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span
                      className={`font-semibold text-lg transition-colors ${
                        isExpanded ? 'text-accentAlt' : 'text-accent'
                      }`}
                    >
                      {a.name}
                    </span>
                    <span className="text-muted text-sm">
                      {a.achieved ? '✓ Achieved' : '✗ Not Achieved'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        completeAchievement(a.id, a.achieved);
                      }}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${
                        a.achieved
                          ? 'bg-success/20 text-success hover:bg-success/30'
                          : 'bg-accent/20 text-accentAlt hover:bg-accent/30'
                      }`}
                    >
                      {a.achieved ? 'Mark Undone' : 'Mark Achieved'}
                    </button>

                    <span
                      className={`text-lg transition-transform ${
                        isExpanded ? 'rotate-180 text-accentAlt' : 'rotate-0 text-muted'
                      }`}
                    >
                      ▼
                    </span>
                  </div>
                </div>

                {/* Always-visible Requires field */}
                <div className="px-5 py-2 border-t border-accent/20 bg-surface/80 text-sm text-text">
                  <p><strong>Requires:</strong> {a.requires || 'None'}</p>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 py-4 border-t border-accent/20 bg-surface/90 space-y-1 text-sm text-text">
                    {a.description && <p><strong>Description:</strong> {a.description}</p>}

                    {a.warning && (
                      <p>
                        <strong>Warning:</strong>{' '}
                        {warningVisible[a.id] ? (
                          <>
                            {a.warning}{' '}
                            <button
                              onClick={() => toggleWarning(a.id)}
                              className="text-accentAlt underline hover:text-accent"
                            >
                              Hide
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => toggleWarning(a.id)}
                            className="text-accentAlt underline hover:text-accent"
                          >
                            Show
                          </button>
                        )}
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
      </ul>
      </div>
  
      {/* Navigation */}
      <div className="text-center mt-6">
        <Link to="/games(achievement)">
          <button className="bg-accentAlt/20 hover:bg-accentAlt/30 text-accentAlt px-4 py-2 rounded-xl font-semibold transition">
            Games List
          </button>
        </Link>
      </div>
  
      {/* Delete Modal */}
      {showModal && (
        <DeleteModal
          itemName={selectedQuest.title}
          onConfirm={handleDelete}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default AchievementsList