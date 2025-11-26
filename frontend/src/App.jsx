import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import { authAPI } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getMe()
        .then(response => setUser(response.data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentView('login');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <button 
          onClick={() => setCurrentView('login')}
          style={{ 
            margin: '0 10px', 
            padding: '10px 20px', 
            backgroundColor: currentView === 'login' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none'
          }}
        >
          Login
        </button>
        <button 
          onClick={() => setCurrentView('register')}
          style={{ 
            margin: '0 10px', 
            padding: '10px 20px', 
            backgroundColor: currentView === 'register' ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none'
          }}
        >
          Register
        </button>
      </div>
      
      {currentView === 'login' ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Register onRegister={handleRegister} />
      )}
    </div>
  );
}

export default App;