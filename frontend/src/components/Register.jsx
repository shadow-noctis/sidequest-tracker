import React, { useState} from 'react'

function Register() {
    const [newUsername, setNewUsername] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState("");

    const registerUser = async () => {
        try{
            const res = await fetch('http://localhost:3001/api/register', {
                method: 'POST',
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    username: newUsername,
                    password: newPassword,
                    confirmPassword: confirmPassword
                }),
            });

            if (!res.ok) {
                throw new Error(`Server error ${res.status}`)
            }
            const data = await res.json();
            setMessage(`User "${data.username}" registered successfully!`);

            //Reset form
            setNewUsername("")
            setNewPassword("")

        } catch (error) {
            console.error('Failed to register:', error)
            setMessage("Registration failed. Please try again.");
        }
    };

    return(
        <div>
            <input
                type='text'
                placeholder='Username'
                value={newUsername}
                onChange={(q) => setNewUsername(q.target.value)}
            />
            <input
                type='password'
                placeholder='Password'
                value={newPassword}
                onChange={(q) => setNewPassword(q.target.value)}
            />
            <input
                type='password'
                placeholder='Confirm password'
                value={confirmPassword}
                onChange={(q) => setConfirmPassword(q.target.value)}
            /> 
            <button onClick={registerUser}>Submit</button>
            {message && <p>{message}</p>}
        </div>
    )
}
export default Register;