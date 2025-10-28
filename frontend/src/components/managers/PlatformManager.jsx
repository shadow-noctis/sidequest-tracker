import React, { useState, useEffect, useContext, useRef } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import DeleteModal from '../DeleteModal'


function PlatformManager() {

    //User token
    const { user } = useContext(AuthContext)
    const token = localStorage.getItem('token');

    //Toast
    const navigate = useNavigate();
    const hasShown = useRef(false)
    const location = useLocation();

    // Store platforms
    const [allPlatforms, setAllPlatforms] = useState([]);

    //Values passed to backend
    const [platformName, setPlatformName] = useState("");
    const [manufacturer, setManufacturer] = useState("");

    // Modal before delete & platform for delete
    const [selectedDelete, setSelectedDelete] = useState(null)
    const [deleteModal, setDeleteModal] = useState(false);

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
            fetchPlatforms();
            resetPlatform();

        } catch (err) {
            console.error('Failed to add platform', err)
        }
    };

    const deletePlatform = () => {
        fetch(`http://localhost:3001/api/platforms/${selectedDelete.id}`, {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json',
                'Authorization': `Bearer: ${token}`
            }
        })
        .then(() => {
            console.log(`${selectedDelete.name} deleted.`)
            toast(`${selectedDelete.name} deleted!`)
            fetchPlatforms();
        })
        .catch(err => {
            console.error('Error deleting platform:', err);
            toast("Failed to delete platform")
        })
        .finally(() => {
            setDeleteModal(false);
        })
    };
    
    const resetPlatform = () => {
        setPlatformName("")
        setManufacturer("")
    };

    const handleDeleteClick = (to_delete) => {
        setSelectedDelete(to_delete);
        setDeleteModal(true);
    }

    const fetchPlatforms = () => {
        const res = fetch('http://localhost:3001/api/platforms')
        .then(res => res.json())
        .then(data => {
            setAllPlatforms(data)
        });
    };

    useEffect(() => {
        fetchPlatforms();
    }, [])

    useEffect(() => {
        if (location.state?.toastMessage && !hasShown.current) {
            toast(location.state.toastMessage);
            hasShown.current = true;
            navigate(location.pathname, {replace: true})
        }
    }, [location, navigate]);

    return(
        <div id="platform_add" className="px-8 py-6 text-text">
            <h2 className="text-4xl font-bold text-accent mb-6 text-center">Platforms</h2>

            {/* List existing platforms*/}
            <section className="mb-8">
            <h3 className="text-2xl text-accentAlt font-semibold mb-4">Existing platforms</h3>
                <ul className="space-y-2">
                    {allPlatforms.map(platform => (
                        <li key={platform.id}
                            className="flex items-center justify-between bg-surface px-4 py-3 rounded-xl shadow-md hover:bg-accent/10 transition">
                            <span className="text-lg font-medium">{platform.name}</span>
                            {user?.role === 'admin' && (<button onClick={() => handleDeleteClick(platform)}
                                className="text-error hover:text-error/80 transition font-semibold">
                                    Delete
                                </button>)}
                        </li>
                    ))}
                </ul>
            </section>

            {/* Add new platform*/}
            <section className="bg-surface p-6 rounded-2xl shadow-xl">
  <div className="space-y-4">
    <h3 className="text-2xl text-accentAlt font-semibold mb-2">
      Add New Platform
    </h3>

    <form
      onSubmit={(e) => {
        e.preventDefault();
        addPlatform();
      }}
      className="space-y-4"
    >
      {/* Platform Name */}
      <label className="block">
        <span className="text-muted">Name</span>
        <input
          type="text"
          placeholder="Platform name"
          value={platformName}
          onChange={(p) => setPlatformName(p.target.value)}
          className="w-full bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition"
        />
      </label>

      {/* Manufacturer */}
      <label className="block">
        <span className="text-muted">Manufacturer</span>
        <input
          type="text"
          placeholder="Manufacturer"
          value={manufacturer}
          onChange={(p) => setManufacturer(p.target.value)}
          className="w-full bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition"
        />
      </label>

      {/* Submit Button */}
      <div className="pt-2 text-center">
        <button
          type="submit"
          className="bg-accent hover:bg-accentAlt text-[#0d0b1e] font-semibold px-6 py-2 rounded-xl shadow-lg transition"
        >
          Add Platform
        </button>
      </div>
    </form>
  </div>

  {/* Delete Modal */}
  {deleteModal && (
    <DeleteModal
      itemName={selectedDelete.name}
      onConfirm={deletePlatform}
      onCancel={() => setDeleteModal(false)}
    />
  )}
</section>

        </ div>
    )

};
export default PlatformManager;