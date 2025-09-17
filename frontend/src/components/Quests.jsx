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

  // Versions related to game and currently selected platform to show
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);

  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  const { gameId } = useParams();
  const navigate = useNavigate();
  const hasShown = useRef(false)

  const { user } = useContext(AuthContext)
  const token = localStorage.getItem('token');

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

  if (loading) return <p>Loading quests...</p>;

  return (
    <div>
      <h2>{gameName}</h2>
      {versions.map(v => (
        <button key={v.id} name={v.id} value={v.name} onClick={handleClick}>{v.name}</button>
      ))}
      <ul>
        {quests.filter(q => q.versions.some(v => v.name === selectedVersion))
        .map(quest => (
          <li key={quest.id}>
            <strong>{quest.title}</strong>
            <ul>
              <li>Description: {quest.description}</li>
              <li>Location: {quest.location}</li>
              <li>Requirements: {quest.requirement}</li>
              <li>Missable: {quest.missable ? ' ✓' : ' ✗'}</li>
              {quest.extras && Object.entries(quest.extras).map(([key, value]) =>
              <li key={key}>
                {key}: {value}
              </li>
              )}
              <li>Completed: {quest.completed ? ' ✓' : ' ✗'}</li>
              {user?.role === 'admin' && (<li><Link to={`/quests/${quest.id}`}>Edit</Link></li>)}
              {user?.role === 'admin' && (<li><button onClick={() => handleDeleteClick(quest)}>Delete</button></li>)}
                <li>
                  <button onClick={() => completeQuest(quest.id, quest.completed)}>
                    {quest.completed ? 'Mark as Not Completed' : 'Mark as Completed'}
                  </button>
                </li>
            </ul>
          </li>
        ))}
      </ul>
      <Link to={'/games'}><button>Games List</button></Link>

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