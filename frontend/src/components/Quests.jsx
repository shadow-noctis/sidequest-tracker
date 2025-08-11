import React, {useEffect, useState} from 'react';

function QuestList() {
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3001/api/quests')
        .then(res => res.json())
        .then(data => {
            setQuests(data);
            setLoading(false);
        })
        .catch(err => {
            console.error('Error fetching quests:', err);
            setLoading(false);
        });
    });

    if (loading) return <p>Loading quests...</p>;

    return(
        <div>
            <h2>Quests</h2>
            <ul>
                {quests.map((quest) => (
                    <li key={quest.id}>
                        <strong>{quest.title}</strong>
                        <ul>
                            <li>Description: {quest.description}</li>
                            <li>Location: {quest.location}</li>
                            <li>Requirements: {quest.requirement}</li>
                            <li>Completed: {quest.completed ? ' 🗹' : ' ✗'}</li>
                            <li>Missable: {quest.missable ? 'Yes' : '✗'}</li>
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default QuestList;