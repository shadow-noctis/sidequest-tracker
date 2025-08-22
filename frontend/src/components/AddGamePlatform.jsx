import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

function AddGamePlatform() {

    //User token
    const token = localStorage.getItem('token');

    const [allPlatforms, setAllPlatforms] = useState([]);
    const [games, setGames] = useState([]);
    
    // Game values
    const [gameName, setGameName] = useState("");
    const [publisher, setPublisher] = useState("");
    const [platforms, setPlatforms] = useState([]);
    const [year, setYear] = useState("");

    //Platform values
    const [platformName, setPlatformName] = useState("");
    const [manufacturer, setManufacturer] = useState("");

    // Add new Game
    const addGame = async () => {
        try{
            const gameRes = await fetch('http://localhost:3001/api/games', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    'name': gameName,
                    'publisher': publisher,
                    'release_date': year,
                    'platforms': platforms
                }),
            });

            if (!gameRes.ok) {
                throw new Error(`Server error ${gameRes.status}`)
            }
            const gameData = await gameRes.json();
            console.log('Game added:', gameData);
            toast(`Game "${gameName}" added`)
            resetGame();

        } catch (err) {
            console.error('Failed to add game', err)
        }
    };

    // Add new Platform
    const addPlatform = async () => {
        try{
            const platformRes = await fetch('http://localhost:3001/api/platforms', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    'name': platformName,
                    'manufacturer': manufacturer
                }),
            });
            if (!platformRes.ok) {
                throw new Error (`Server error ${platformRes.status}`)
            }

            const platformData = await platformRes.json();
            console.log('Platform added:', platformData);
            toast(`Platform "${platformName}" added`);
            resetPlatform()

        } catch (err) {
            console.error('Failed to add platform', err)
        }
    }

    const handleChecked = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setPlatforms((prev) => [...prev, value]);
        } else {
            setPlatforms((prev) => prev.filter((p) => p !== value));
        }
    };
    
    
    //Reset forms
    const resetGame = () => {
        setGameName("")
        setPublisher("")
        setYear("")
        };

    const resetPlatform = () => {
        setPlatformName("")
        setManufacturer("")
        };


    // Get platforms:
    useEffect(() => {
        fetch('http://localhost:3001/api/platforms')
        .then(res => res.json())
        .then(data => {
            setAllPlatforms(data)
        })
    }, [])

    // Get games
    useEffect(() => {
        fetch('http://localhost:3001/api/games')
        .then(res => res.json())
        .then(data => {
            setGames(data)
        })
    }, [])

    return(
        <>
            <div>
                <h4>Existing games</h4>
                <ul>
                    {games.map(game => (
                        <li key={game.name}>{game.name}</li>
                    ))}
                </ul>
                <h3>Add New Game</h3>
                <input 
                    type='text'
                    placeholder='Name'
                    value={gameName}
                    onChange={(g) => setGameName(g.target.value)}                
                />
                <input 
                    type='text'
                    placeholder='Publisher'
                    value={publisher}
                    onChange={(g) => setPublisher(g.target.value)}                
                />
                <input 
                    type='text'
                    placeholder='Release year'
                    value={year}
                    onChange={(g) => setYear(g.target.value)}                
                />
                {allPlatforms.map(platform => (
                    <ul>
                        <li key={platform.id}>
                            <input type='checkbox' value={platform.name} onChange={handleChecked} />
                            <label>{platform.name}</label>
                        </li>
                    </ ul>
                ))}
                <p>Selected: {platforms.join(", ")}</p>
                <button onClick={addGame}>Add Game</button>
            </div>
            <div>
                <h3>Add New Platform</h3>
                <h4>Existing Platforms</h4>
                <ul>
                    {allPlatforms.map(platform => (
                        <li key={platform.id}>{platform.name}</li>
                    ))}
                </ul>
                <input 
                    type='text'
                    placeholder='Name'
                    value={platformName}
                    onChange={(p) => setPlatformName(p.target.value)}            
                />
                <input 
                    type='text'
                    placeholder='Manufacturer'
                    value={manufacturer}
                    onChange={(p) => setManufacturer(p.target.value)}      
                />
                <button onClick={addPlatform}>Add Platform</button>
            </div>
        </>
    )

    
}

export default AddGamePlatform