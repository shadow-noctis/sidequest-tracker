import React, { useState, useContext } from 'react'
import { AuthContext } from './AuthContext'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) throw new Error ('Login failed');

            const data = await res.json()
            login(data.token);
            navigate("/", {state: {toastMessage: 'Login Succesful!'}})
                

        } catch (err) {
            console.error("Login error:", err);
            setMessage("Login failed\nCheck credentials")
        }
    };
    
    return (
        <>
            <form onSubmit={handleSubmit}>
                <h2>Login</h2>
                <input
                    type='text'
                    placeholder='Username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    />
                <input
                    type='password'
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type='submit'>Login</button>
                <p>{message}</p>
            </form>
        </>
    );
}