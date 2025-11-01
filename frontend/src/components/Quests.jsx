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
        setQuests(data);
        console.log("Quests: ", data);
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

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-black text-gray-100 px-6 py-10">
      <p className="text-center text-indigo-300">Loading quests...</p>
    </div>
  );

return (
  <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-black text-gray-100 px-6 py-10">
    {/* Version Selector */}
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-md rounded-2xl shadow-[0_0_25px_rgba(140,90,255,0.4)] p-8 border border-indigo-700/40">
      <h2 className="text-center text-4xl font-bold text-indigo-300 mb-6 tracking-wide drop-shadow-[0_0_10px_rgba(180,120,255,0.6)]">{gameName}</h2>
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
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-[0_0_15px_rgba(140,90,255,0.4)]'
                : 'bg-gray-800/50 text-indigo-100 border-indigo-700/40 hover:border-indigo-600/60 hover:bg-indigo-900/40'}
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
        ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
        : 'bg-indigo-600/80 hover:bg-indigo-600 text-white'}
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
        ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
        : 'bg-indigo-600/80 hover:bg-indigo-600 text-white'}
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
              className="bg-gray-800/50 border border-indigo-700/40 rounded-2xl shadow-md hover:shadow-[0_0_15px_rgba(140,90,255,0.3)] overflow-hidden transition-all"
            >
              {/* Header: title + status + complete button */}
              <div
                onClick={() => toggleQuest(quest.id)}
                className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-indigo-900/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-indigo-200 font-semibold text-lg">{quest.title}</span>
                  <span className="text-gray-400 text-sm">
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
                        ? 'bg-green-600/30 text-green-300 hover:bg-green-600/40'
                        : 'bg-indigo-600/30 text-indigo-200 hover:bg-indigo-600/40'
                    }`}
                  >
                    {quest.completed ? 'Mark Not Done' : 'Mark Done'}
                  </button>

                  <span className="text-gray-400 text-lg">
                    {expandedQuests[quest.id] ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedQuests[quest.id] && (
                <div className="px-5 py-4 border-t border-indigo-700/40 bg-gray-800/70 space-y-1 text-sm text-gray-100">
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
                            className="text-indigo-300 underline hover:text-indigo-200"
                          >
                            Hide
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => toggleHint(quest.id)}
                          className="text-indigo-300 underline hover:text-indigo-200"
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
                        className="text-indigo-300 hover:text-indigo-200 underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(quest)}
                        className="text-red-400 hover:text-red-300 underline"
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
        <button className="bg-indigo-600/80 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold transition shadow-[0_0_15px_rgba(140,90,255,0.4)]">
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