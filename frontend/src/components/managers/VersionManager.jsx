import React, { useState, useEffect, useContext, useRef } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import ConfirmModal from '../ConfirmModal'

function VersionManager() {

    //User token
    const { user } = useContext(AuthContext)
    const token = localStorage.getItem('token');

    //Toast
    const navigate = useNavigate();
    const hasShown = useRef(false)
    const location = useLocation();

    const [games, setGames] = useState([]);

    //Selected for delete
    const [selectedDelete, setSelectedDelete] = useState(null);

    // Modals
    const [confirmModal, setConfirmModal] = useState(false);
    
    // Quest count for confirmModal:
    const [questCount, setQuestCount] = useState(0);

    // Version values:
    const [versions, setVersions] = useState([])
    const initialVersionForm = {
        name: "",
        year: "",
        publisher: "",
        gameId: null,
        extras: []
    }

    const [versionForm, setVersionForm] = useState(initialVersionForm);

    // Add Version
    const addVersion = async (e) => {
        e.preventDefault();
        if (!versionForm.gameId) {
            alert("Please select at least one game.")
            return;
        }
        try{
            const res = await fetch('http://localhost:3001/api/versions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...versionForm,
                    extras: JSON.stringify(versionForm.extras)
                }),
            });

            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`)
            }
            const data = await res.json();
            console.log('Version added:', data);
            resetVersion();
            fetchVersions();
            toast("Version added")
        } catch (err) {
            console.error('Failed to add version: ', err)
        }
    };

    const handleDeleteClick = (to_delete) => {
        setSelectedDelete(to_delete);
        deleteVersion(to_delete)
    }

const deleteVersion = async (ver) => {
        try{
            const res = await fetch(`http://localhost:3001/api/versions/${ver.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer: ${token}`
                }
            })
            if (res.status == 409) {
                const data = await res.json();
                console.log(`Requires confirmation: ${data.requireConfirmation}, questCount: ${data.questCount}`)
                setQuestCount(data.questCount)
                setConfirmModal(true)
                return;
            }

            if (!res.ok) {
                throw new Error(`Server error ${res.status}`)
            }

            const data = await res.json()
            console.log(`${ver.name} deleted.`);
            toast(`${ver.name} deleted!`);
            fetchVersions();
            setConfirmModal(false);
            return;
        } catch (err) {
            console.error('Failed to delete version:', err)
        }
    };

    const forceDeleteVersion = async () => {
        try{
            const res = await fetch(`http://localhost:3001/api/versions/${selectedDelete.id}?force=true`, {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer: ${token}`
                    }
                });
                console.log(`${selectedDelete.name} and ${questCount} related quests deleted`)
                toast(`Version deleted succesfully!`)
                fetchVersions();
                setConfirmModal(false);
            } catch (err) {
                console.log(`Error deleting version:`, err)
            }
        };
    
    // Update the form
    const handleChange = (e) => {
        const { name, value } = e.target;

        setVersionForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Adding extras for the version:
    const addExtra = () => {
        setVersionForm(prev => ({ ...prev, extras: [...prev.extras, ""] }));
        };

    const handleExtraChange = (index, value) => {
        setVersionForm(prev => {
            const newExtras = [...prev.extras];
            newExtras[index] = value;
            return { ...prev, extras: newExtras };
        });
        };

    const removeExtra = (index) => {
        setVersionForm(prev => ({
            ...prev,
            extras: prev.extras.filter((_, i) => i !== index)
        }));
        };
    
    // Reset form    
    const resetVersion = () => {
        setVersionForm(initialVersionForm)
    }

    const fetchGames = () => {
        const gameres =  fetch('http://localhost:3001/api/games')
        .then(gameres => gameres.json())
        .then(data => {
            setGames(data)
        });
    };

    const fetchVersions = async () => {
        const verRes = fetch('http://localhost:3001/api/versions')
        .then(verRes => verRes.json())
        .then(data => {
            setVersions(data)
            console.log("versions: ", data)
        })
    };

    // Fetch versions and games
    useEffect(() => {
        fetchGames();
        fetchVersions();
    }, []);

    // Show toast when returning from successful add/edit/delete
    useEffect(() => {
        if (location.state?.toastMessage && !hasShown.current) {
            toast(location.state.toastMessage);
            hasShown.current = true;
            navigate(location.pathname, {replace: true})
        }
    }, [location, navigate]);

    return(
        <div id='version_add'>
            <h2>Versions</h2>

            {/* List existing versions*/}
            <h3>Existing Versions</h3>
            {versions.map(ver => (
                <div key={ver.gameName}>
                    <h5>{ver.gameName}</h5>
                    <ul>
                        {ver.version.map(v => (
                            <li key={v.id}>
                                {v.name}
                                {user?.role === 'admin' && (<button onClick={() => handleDeleteClick(v, 'version')}>Delete</button>)}
                                {user?.role === 'admin' && (<Link to={`/versions/${v.id}`}>Edit</Link>)}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            {/* Add new Version*/}
            <div>
                <form onSubmit={addVersion}>
                    <h3>Add version</h3>
                    <label>
                        Name:
                        <input name='name' placeholder='Name' value={versionForm.name} onChange={handleChange}/>
                    </label><br />
                    <label>
                        Year:
                        <input name='year' placeholder='Release Year' value={versionForm.year} onChange={handleChange} />
                    </label><br />
                    <label>
                        Developer:
                        <input name='publisher' placeholder='Developer' value={versionForm.publisher} onChange={handleChange} />
                    </label><br />
                    <label>
                        Game:
                        <select name='gameId' value={versionForm.gameId || ""} onChange={handleChange}>
                        <option value="">
                            -- Select a Game --
                        </option>
                        {games.map((g) => (
                            <option key={g.id} value={g.id}>
                                {g.name}
                            </option>
                        ))}
                        </select>
                    </label><br />

                    <label>
                    Extras:
                        {versionForm.extras.map((extra, idx) => (
                            <div key={idx}>
                                <input
                                    type='text'
                                    placeholder='Extra field name'
                                    value={extra}
                                    onChange={e => handleExtraChange(idx, e.target.value)}
                                    />
                                    <button type='button' onClick={() => removeExtra(idx)}>Delete</button>
                            </div>
                        ))}
                        <button type='button' onClick={addExtra}>Add Extra</button><br />
                        <p>Extras: {versionForm.extras}</p>
                    </label><br />
                    <button type='submit'>Add Version</button>
                    <button type='button' onClick={resetVersion}>Clear</button>
                </form>
            </div>

            {confirmModal && (
                    <ConfirmModal
                    itemName={selectedDelete.name}
                    onConfirm={forceDeleteVersion}
                    onCancel={() => setConfirmModal(false)}
                    questCount={questCount}
                    />
                )}
        </div>
    )

};

export default VersionManager;