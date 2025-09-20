import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function GamesAchievement() {
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        fetch('http://localhost:3001/api/games')
        .then(res => res.json())
        .then(data => {
            setGames(data)
            setLoading(false)
        })
        .catch(err => {
            console.error('Error fetching games:', err);
            setLoading(false);
        })
    }, []);

    if (loading) return <p>Loading games</p>;

    return (
        <div>
            <h2>Games</h2>
            <ul>
                {games.map(game => (
                    <li key={game.id}>
                        <Link to={`/games/${game.id}/achievements`} state={{ gameName: game.name}}>{game.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default GamesAchievement;