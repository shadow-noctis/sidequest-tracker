import React, { useEffect, useState } from 'react';

function QuestList() {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  // Mark quest as completed
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

  // Fetch quests on mount
  useEffect(() => {
    fetch('http://localhost:3001/api/quests', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setQuests(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching quests:', err);
        setLoading(false);
      });
  }, [token]);

  if (loading) return <p>Loading quests...</p>;

  return (
    <div>
      <h2>Quests</h2>
      <ul>
        {quests.map(quest => (
          <li key={quest.id}>
            <strong>{quest.title}</strong>
            <ul>
              <li>Description: {quest.description}</li>
              <li>Location: {quest.location}</li>
              <li>Requirements: {quest.requirement}</li>
              <li>Missable: {quest.missable ? ' ✓' : ' ✗'}</li>
              <li>Completed: {quest.completed ? ' ✓' : ' ✗'}</li>
                <li>
                  <button onClick={() => completeQuest(quest.id, quest.completed)}>
                    {quest.completed ? 'Mark as Not Completed' : 'Mark as Completed'}
                  </button>
                </li>
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuestList;