import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";
import DeleteModal from './DeleteModal'

function QuestList() {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [gameName, setGameName] = useState(location.state?.gameName);
  // Selected quest if delete, edit etc.
  const [selectedQuest, setSelectedQuest] = useState(null);
  
  const [hintsVisible, setHintsVisible] = useState({});
  const [expandedQuests, setExpandedQuests] = useState({});

  // Versions related to game and currently selected platform to show
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);

  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  const { gameId } = useParams();
  const navigate = useNavigate();
  const hasShown = useRef(false)

  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  const [allExpanded, setAllExpanded] = useState(false)

  
  
  // Expand or collapse quest info:
  const toggleQuest = (id) => {
    setExpandedQuests((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    quests.forEach((q) => (allExpanded[q.id] = true));
    setExpandedQuests(allExpanded);
    setAllExpanded(true)
  }

  const collapseAll = () => {
    setExpandedQuests({});
    setAllExpanded(false)
  };

  // Show or hide hint
  const toggleHint = (id) => {
    setHintsVisible(prev => ({ 
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle when delete clicked (confirm with Modal)
  const handleDeleteClick = (quest) => {
    setSelectedQuest(quest);
    setShowModal(true);
  }

  // Handle delete after confirmed
  const handleDelete = () => {
    fetch(`http://localhost:3001/api/quests/${selectedQuest.id}`, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer: ${token}`
      }
    })
    .then(() => {
      console.log("Quest deleted!")
      toast("Quest deleted!")
    });

    setShowModal(false);
  }

  const handleClick = (e) => {
      const { value } = e.target;
      setSelectedVersion(value);    
    }
  
  // Mark as completed
  async function completeQuest(questId, currentCompleted) {
    try {
      const res = await fetch(`http://localhost:3001/api/quests/${questId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: !currentCompleted })
      });

      if (!res.ok) throw new Error('Failed to update quest');

      // Refetch quests to update UI
      const questsRes = await fetch('http://localhost:3001/api/quests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    setQuests(prev =>
      prev.map(q => q.id === questId ? { ...q, completed: !currentCompleted } : q)
    );

    } catch (err) {
      console.error('Error completing quest:', err);
    }
  }

    // Show toast when returning from successful add/edit/delete (admin only)
    useEffect(() => {
        if (location.state?.toastMessage && !hasShown.current) {
            toast(location.state.toastMessage);
            hasShown.current = true;
            navigate(location.pathname, {replace: true})
        }
    }, [location, navigate]);

  // Fetch quests on mount
  useEffect(() => {
    fetch(`http://localhost:3001/api/games/${gameId}/quests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        console.log("Quests: ", data);
        const sortedQuests = data.sort((a, b) => a.title.localeCompare(b.title));
        setQuests(sortedQuests);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching quests:', err);
        setLoading(false);
      });
  }, [gameId, token, showModal]);


  // Get versions
  useEffect(() => {
    fetch(`http://localhost:3001/api/versions/${gameId}`)
    .then(res => res.json())
    .then(data => {
      console.log("Versions:", data)
      setSelectedVersion(data[0].name)
      setVersions(data)
    })
    .catch(err => {
      console.error('Error retrieving versions:', err);
      setLoading(false);
    })
  }, [])

  //Get game name if not set
  useEffect(() => {
   if (!gameName) {
    fetch(`http://localhost:3001/api/games/${gameId}/name`)
    .then(res => res.json())
    .then(data => {
      console.log("GameName: ", data)
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

    {/* Version Selector */}
    <div className="mx-auto mt-8 bg-surface/70 border border-accent/20 rounded-2xl shadow-lg shadow-accent/10 p-4">
      <h2 className="text-center text-3xl text-accent px-4 py-4">{gameName}</h2>
      <div className="flex justify-center gap-2 mb-4">
        {versions.map(v => (
          <button
            key={v.id}
            name={v.id}
            value={v.name}
            onClick={handleClick}
            className={`
              flex-1 px-3 py-2 text-sm sm:text-base tracking-wide font-bold rounded-lg
              border transition-all duration-200
              ${selectedVersion === v.name
                ? 'bg-accentAlt text-background border-accentAlt shadow-lg shadow-accentAlt/30'
                : 'bg-surface text-accent border-accent/30 hover:border-accent/80 hover:bg-accent/10'}
            `}
          >
            {v.name}
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


      {/* Quests */}
      <ul className="space-y-4">
        {quests
          .filter(q => q.versions.some(v => v.name === selectedVersion))
          .map(quest => (
            <li
              key={quest.id}
              className="bg-surface/90 border border-accent/20 rounded-2xl shadow-md shadow-accent/10 overflow-hidden"
            >
              {/* Header: title + status + complete button */}
              <div
                onClick={() => toggleQuest(quest.id)}
                className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-accent/10 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-accentAlt font-semibold text-lg">{quest.title}</span>
                  <span className="text-muted text-sm">
                    {quest.completed ? '✓ Completed' : '✗ Incomplete'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      completeQuest(quest.id, quest.completed);
                    }}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      quest.completed
                        ? 'bg-success/20 text-success hover:bg-success/30'
                        : 'bg-accent/20 text-accentAlt hover:bg-accent/30'
                    }`}
                  >
                    {quest.completed ? 'Mark Not Done' : 'Mark Done'}
                  </button>

                  <span className="text-muted text-lg">
                    {expandedQuests[quest.id] ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedQuests[quest.id] && (
                <div className="px-5 py-4 border-t border-accent/20 bg-surface/80 space-y-1 text-sm text-text">
                  <p><strong>Description:</strong> {quest.description}</p>
                  <p><strong>Location:</strong> {quest.location}</p>
                  <p><strong>Requirements:</strong> {quest.requirement}</p>
                  <p><strong>Missable:</strong> {quest.missable ? ' ✓' : ' ✗'}</p>

                  {quest.extras && Object.entries(quest.extras).map(([key, value]) => (
                    <p key={key}><strong>{key}:</strong> {value}</p>
                  ))}

                  {quest.hint && (
                    <p>
                      <strong>Hint:</strong>{' '}
                      {hintsVisible[quest.id] ? (
                        <>
                          {quest.hint}{' '}
                          <button
                            onClick={() => toggleHint(quest.id)}
                            className="text-accentAlt underline hover:text-accent"
                          >
                            Hide
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => toggleHint(quest.id)}
                          className="text-accentAlt underline hover:text-accent"
                        >
                          Show
                        </button>
                      )}
                    </p>
                  )}

                  {user?.role === 'admin' && (
                    <div className="pt-2 space-x-3">
                      <Link
                        to={`/quests/${quest.id}`}
                        className="text-accentAlt hover:text-accent underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(quest)}
                        className="text-error hover:text-error/80 underline"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
      </ul>
    </div>

    {/* Navigation */}
    <div className="text-center mt-6">
      <Link to="/games(quest)">
        <button className="bg-accentAlt/20 hover:bg-accentAlt/30 text-accentAlt px-4 py-2 rounded-xl font-semibold transition">
          Games List
        </button>
      </Link>
    </div>

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

export default QuestList;