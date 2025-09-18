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
        <div id="platform_add">
            <h2>Platforms</h2>

            {/* List existing platforms*/}
            <h3>Existing platforms</h3>
            <ul>
                {allPlatforms.map(platform => (
                    <li key={platform.id}>{platform.name}
                        {user?.role === 'admin' && (<button onClick={() => handleDeleteClick(platform)}>Delete</button>)}
                    </li>
                ))}
            </ul>

            {/* Add new platform*/}
            <h3>Add New Platform</h3>

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

        {deleteModal && (
            <DeleteModal
            itemName={selectedDelete.name}
            onConfirm={deletePlatform}
            onCancel={() => setDeleteModal(false)}
            />
        )}
        </ div>
    )

};
export default PlatformManager;