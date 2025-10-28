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

    return (
        <div id="version_add" className="px-8 py-6 text-text">
          <h2 className="text-4xl font-bold text-accent mb-6 text-center">Versions</h2>
    
          {/* Existing Versions */}
          <section className="mb-8">
            <h3 className="text-2xl text-accentAlt font-semibold mb-4">
              Existing Versions
            </h3>
    
            {versions.map((ver) => (
              <div key={ver.gameName} className="mb-6">
                <h4 className="text-xl font-semibold text-accentAlt mb-2 border-b border-accent/30 pb-1">
                  {ver.gameName}
                </h4>
                <ul className="space-y-2">
                  {ver.version.map((v) => (
                    <li
                      key={v.id}
                      className="flex items-center justify-between bg-surface px-4 py-3 rounded-xl shadow-md hover:bg-accent/10 transition"
                    >
                      <span className="text-lg font-medium">{v.name}</span>
                      <div className="flex gap-3">
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDeleteClick(v, 'version')}
                            className="text-error hover:text-error/80 transition font-semibold"
                          >
                            Delete
                          </button>
                        )}
                        {user?.role === 'admin' && (
                          <Link
                            to={`/versions/${v.id}`}
                            className="text-accentAlt hover:text-accent font-medium"
                          >
                            Edit
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
    
          {/* Add New Version */}
          <section className="bg-surface p-6 rounded-2xl shadow-xl">
            <h3 className="text-2xl text-accentAlt font-semibold mb-4">
              Add New Version
            </h3>
    
            <form onSubmit={addVersion} className="space-y-4">
              {/* Name */}
              <label className="block">
                <span className="text-muted">Name</span>
                <input
                  name="name"
                  placeholder="Version name"
                  value={versionForm.name}
                  onChange={handleChange}
                  className="w-full bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition"
                />
              </label>
    
              {/* Year */}
              <label className="block">
                <span className="text-muted">Release Year</span>
                <input
                  name="year"
                  placeholder="e.g. 2022"
                  value={versionForm.year}
                  onChange={handleChange}
                  className="w-full bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition"
                />
              </label>
    
              {/* Developer */}
              <label className="block">
                <span className="text-muted">Developer</span>
                <input
                  name="publisher"
                  placeholder="Developer name"
                  value={versionForm.publisher}
                  onChange={handleChange}
                  className="w-full bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition"
                />
              </label>
    
              {/* Game */}
              <label className="block">
                <span className="text-muted">Game</span>
                <select
                  name="gameId"
                  value={versionForm.gameId || ''}
                  onChange={handleChange}
                  className="w-full bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition"
                >
                  <option value="">-- Select a Game --</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </label>
    
              {/* Extras */}
              <div>
                <span className="text-muted block mb-2">Extras</span>
                <div className="space-y-2">
                  {versionForm.extras.map((extra, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-[#1a1633] p-2 rounded-xl"
                    >
                      <input
                        type="text"
                        placeholder="Extra field name"
                        value={extra}
                        onChange={(e) => handleExtraChange(idx, e.target.value)}
                        className="flex-1 bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => removeExtra(idx)}
                        className="text-error hover:text-error/80 transition font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
    
                  <button
                    type="button"
                    onClick={addExtra}
                    className="text-accentAlt hover:text-accent font-semibold"
                  >
                    + Add Extra
                  </button>
                </div>
              </div>
    
              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-accent hover:bg-accentAlt text-[#0d0b1e] font-semibold px-6 py-2 rounded-xl shadow-lg transition"
                >
                  Add Version
                </button>
                <button
                  type="button"
                  onClick={resetVersion}
                  className="bg-muted/30 hover:bg-muted/50 text-text font-semibold px-6 py-2 rounded-xl shadow-lg transition"
                >
                  Clear
                </button>
              </div>
            </form>
          </section>
    
          {/* Confirm Modal */}
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