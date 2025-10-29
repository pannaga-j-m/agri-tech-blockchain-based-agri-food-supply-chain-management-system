import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [status, setStatus] = useState('');
    const [messageColor, setMessageColor] = useState('black');
    const navigate = useNavigate();

    const handleRegister = async () => {
        // Add a console log to be 100% sure the function is called
        console.log("Create Account button clicked!"); 
        setStatus('Registering...');
        setMessageColor('blue');

        try {
            const response = await fetch('http://localhost:5001/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, walletAddress })
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('Registration successful! Redirecting to login...');
                setMessageColor('green');
                setTimeout(() => navigate('/farmer'), 2000);
            } else {
                setStatus(data.message || 'Registration failed.');
                setMessageColor('red');
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            setStatus("Failed to connect to the server. Is the backend running?");
            setMessageColor('red');
        }
    };

    return (
        <div style={{ border: "1px solid #ccc", padding: "40px", borderRadius: "8px", textAlign: "center", maxWidth: "400px", margin: "50px auto" }}>
            <h2>Create Farmer Account</h2>
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ margin: "10px 0", padding: "10px", width: "90%" }} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ margin: "10px 0", padding: "10px", width: "90%" }} />
            <input type="text" placeholder="Your Wallet Address" value={walletAddress} onChange={e => setWalletAddress(e.target.value)} style={{ margin: "10px 0", padding: "10px", width: "90%" }} />
            <button onClick={handleRegister} style={{ padding: "12px 24px", fontSize: "16px", cursor: "pointer" }}>
                Create Account
            </button>
            {status && <p style={{ marginTop: "15px", color: messageColor, fontWeight: "bold" }}>{status}</p>}
            <p style={{ marginTop: "20px" }}>
                Already have an account? <Link to="/farmer">Login here</Link>
            </p>
        </div>
    );
};

export default RegisterPage;