const Dashboard = ({ user, onLogout }) => {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Dashboard</h1>
        <button 
          onClick={onLogout}
          style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none' }}
        >
          Logout
        </button>
      </div>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '5px' }}>
        <h3>Welcome, {user.name}!</h3>
        <p>Email: {user.email}</p>
        <p>This is your dashboard. You can add more features here.</p>
      </div>
    </div>
  );
};

export default Dashboard;