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
  }

  const collapseAll = () => {
    setExpandedAchievements({});
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
  
  // Mark as completed
  async function completeQuest(achievementId, currentAchieved) {
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
    console.log("Fetching achievements...")
    fetch(`http://localhost:3001/api/games/${gameId}/achievements`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setAchievements(data);
        console.log("Achievements: ", data);
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
    <div>
      <h2>{gameName}</h2>
      {platforms.map(p => (
        <button key={p.id} name={p.id} value={p.name} onClick={handleClick}>{p.name}</button>
      ))}<br />
      <button onClick={expandAll}>Expand All</button>
      <button onClick={collapseAll}>Collapse All</button>
      <ul>
        {achievements.filter(a => a.platforms.some(p => p.name === selectedPlatform))
        .map(a => (
          <li key={a.id}>
            <div onClick={() => toggleQuest(a.id)} style={{ cursor: "pointer" }}>
              <strong>{a.name}</strong> {expandedAchievements[a.id] ? "▲" : "▼"}
            </div>

            {expandedAchievements[a.id] && (
              <ul>
                <li>Requires: {a.requires}</li>
                {a.description && (<li>Description: {a.description}</li>)}
                {a.warning && (<li>Warning: {a.warning}</li>)}
                {a.warning && (
                  <li>Warning: {warningVisible[a.id] ? (
                    <>{a.warning}
                    <button onClick={() => toggleWarning(a.id)}>Hide Warning</button>
                    </>
                  ) : (
                    <button onClick={() => toggleWarning(a.id)}>Show Warning</button>
                  )}
                  </li>
                )}
                <li>Achieved: {a.achieved ? ' ✓' : ' ✗'}</li>
                  <li>
                    <button onClick={() => completeQuest(a.id, a.achieved)}>
                      {a.achieved ? 'Mark undone' : 'Mark as Achieved'}
                    </button>
                  </li>
              </ul>
            )}
          </li>
        ))}
      </ul>
      <Link to={'/games(achievement)'}><button>Games List</button></Link>

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