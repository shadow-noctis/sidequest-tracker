import React, { useState} from 'react'

function Login() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")

    async function loginUser() {
        try {
            const res = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                throw new Error (`Login failed: ${response.status}`);
            }

            const data = await res.json();
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            console.error('Login error:', error);
        }
    }

    return(
        <>
        <h2>Login</h2>
            <input
                type='text'
                placeholder='Username'
                value={username}
                onChange={(q) => setUsername(q.target.value)}
            />
            <input
                type='password'
                placeholder='Password'
                value={password}
                onChange={(q) => setPassword(q.target.value)}
            />
            <button onClick={loginUser}>Login</button>
        </>
    );
}

export default Login;