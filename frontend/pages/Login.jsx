import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../src/config'; // ✅ dynamic base URL
function UserLogin() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();



  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/login-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', name);
        alert("Login successful!");
        navigate('/feed');
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed.");
    }
  };

  const handleGoogleLogin = async (response) => {
    const token = response.credential;
    try {
      const res = await fetch(`${API_BASE_URL}/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', data.name);
        alert("Google login successful!");
        navigate('/feed');
      } else {
        alert("Google login failed.");
      }
    } catch (error) {
      console.error("Google login error", error);
      alert("Login failed.");
    }
  };

  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID_HERE", // Replace with your actual client ID
        callback: handleGoogleLogin,
      });

      google.accounts.id.renderButton(
        document.getElementById("googleLoginDiv"),
        { theme: "outline", size: "large" }
      );
    }
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '10%' }}>
      <h2>Login Page</h2>

      <input
        type="text"
        placeholder="Enter Username"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ margin: '10px', padding: '10px', width: '250px' }}
      />
      <br />
      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ margin: '10px', padding: '10px', width: '250px' }}
      />
      <br />
      <button onClick={handleLogin} style={{ padding: '10px 20px' }}>Login</button>

      <p>or</p>

      <div id="googleLoginDiv"></div>

      <p>Don't have an account? <a href="/Registration">Register</a></p>
    </div>
  );
}

export default UserLogin;
