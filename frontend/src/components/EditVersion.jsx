import { useState, useEffect, version } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

function EditVersion() {
    const token = localStorage.getItem('token');

    const [editVersion, setEditVersion] = useState(null);
    const { versionId } = useParams();
    const navigate = useNavigate();
    const [versionForm, setVersionForm] = useState({
        name: "",
        developer: "",
        year: "",
        gameId: null,
        extras: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVersionForm((prev) =>({
            ...prev,
            [name] : value,
        }));
    };

    const handleExtraChange = (e) => {
        const { name, value } = e.target;
        const newExtras = versionForm.extras.filter((extra) => extra !== name);
        newExtras.push(value);
        setVersionForm((prev) => ({
            ...prev,
            extras: newExtras
        }))
    };

    const handleDeleteExtra = (e) => {
        const { value } = e.target;
        console.log(value)
        const newExtras = versionForm.extras.filter((extra) => extra !== value)
        setVersionForm((prev) => ({
            ...prev,
            extras: newExtras
        }))
    }

    const handleAddExtra = () => {
        setVersionForm((prev) => ({
            ...prev,
            extras: [...(prev.extras || []), ""]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:3001/api/versions/${versionId}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({...versionForm, extras: JSON.stringify(versionForm.extras)}),
            });
            if (!res.ok) {
                throw new Error("Failed to update game")}
                navigate(`/game-setup`, { state: {toastMessage: 'Version updated!', openSection: 'versions' }});
        } catch (err) {
            console.error("Error updating game:", err);
        }
    };

    useEffect(() => {
        fetch(`http://localhost:3001/api/versions/${versionId}/ver`)
            .then((res) => res.json())
            .then((data) => {
                console.log("Version: ", data)
                setEditVersion(data)
                console.log(data.name)
                setVersionForm({
                    id: data.id,
                    name: data.name,
                    developer: data.publisher,
                    year: data.release_date,
                    gameId: data.game_id,
                    extras: data.extras
                });
            });
    }, []);

    if (!editVersion) return <p>Loading quest...</p>;

    return(
        <>
            <div>
                <h2>Edit Version:</h2>
                <h3>{editVersion.name}</h3>
                <ul>
                    <li>Name: {editVersion.name}</li><br />
                    <li>Developer: {editVersion.publisher}</li><br />
                    <li>Release Year: {editVersion.release_date}</li><br />
                    <li>Game: {editVersion.gameName}</li><br />
                    <li>Extras:</li><br />
                        <ul> 
                        {editVersion.extras && editVersion.extras.map(extraName => (
                            <li>{extraName}</li>
                        ))
                        }
                        </ul><br />
                </ul>
                
            </div>
            <div>
                <form onSubmit={handleSubmit}>
                    <label>
                        Name:
                        <input name="name" value={versionForm.name} onChange={handleChange} />
                    </label><br />
                    <label>
                        Developer:
                        <input name="developer" value={versionForm.developer} onChange={handleChange} />
                    </label><br />
                    <label>
                        Release Year:
                        <input name='year' value={versionForm.year} onChange={handleChange}></input>
                    </label><br />
                    <label>
                        Game:<br />
                        <input name='gameId' value={versionForm.gameId} type='radio' disabled={true} checked={true}/>
                        {editVersion.gameName}
                    </label><br />
                    <label>
                        Extras:
                        <ul>
                            {versionForm.extras && versionForm.extras.map(extraName => (
                                <li>
                                    <input name={extraName} placeholder='Extra field name' value={extraName} onChange={handleExtraChange}/>
                                    <button type='button' value={extraName} onClick={handleDeleteExtra}>Delete</button>
                                </li>
                            ))}
                        </ul>
                        <button type='button' onClick={handleAddExtra}>Add Extra</button>
                        <p>Extras: {versionForm.extras.join(", ")}</p>
                    </label><br />

                    <p>Name: {versionForm.name}<br />Developer: {versionForm.developer}<br />Year: {versionForm.year}<br />
                    GameId: {versionForm.gameId}<br /> Extras: {versionForm.extras}
                    </p>
                    <button type='submit'>Save Changes</button>
                    <button type='button'><Link to={`/game-setup`} state={{ openSection: 'versions'}}>Return</Link></button>

                </form>
            </div>
        </>


    )
}

export default EditVersion;