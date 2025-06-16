import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../src/config'; // ✅ dynamic base URL

function RegisterUser() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleName = (e) => setName(e.target.value);
  const handlePassword = (e) => setPassword(e.target.value);

  const addUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/add-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (response.ok && data.success) {
        // Clear form and navigate to login
        setName('');
        setPassword('');
        navigate('/login');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Server error. Please try again later.');
    }
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f2f2f2',
    fontFamily: 'Arial',
  };

  const inputStyle = {
    padding: '10px',
    margin: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    width: '250px',
    fontSize: '16px',
  };

  const buttonStyle = {
    padding: '10px 20px',
    marginTop: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  };

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>Registration Page</div>

      <input
        type="text"
        placeholder="Create Username"
        value={name}
        onChange={handleName}
        style={inputStyle}
      />

      <input
        type="password"
        placeholder="Set Password"
        value={password}
        onChange={handlePassword}
        style={inputStyle}
      />

      <p>
        Already have an account?{' '}
        <a href="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
          Login
        </a>
      </p>

      <button onClick={addUser} style={buttonStyle}>
        Create
      </button>
    </div>
  );
}

export default RegisterUser;
