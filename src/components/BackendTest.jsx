import { useState, useEffect } from 'react';

const BackendTest = () => {
  const [status, setStatus] = useState('Checking...');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/test-connection')
      .then(response => response.json())
      .then(data => {
        setStatus(data.status);
        setMessage(data.message);
      })
      .catch(err => {
        setStatus('Error');
        setMessage('Gagal terhubung ke Backend (Pastikan server FastAPI jalan!)');
        console.error(err);
      });
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h3>🔌 Status Koneksi Backend:</h3>
      <p style={{ color: status === 'connected' ? 'green' : 'red', fontWeight: 'bold' }}>
        {status.toUpperCase()}
      </p>
      <p>{message}</p>
    </div>
  );
};

export default BackendTest;
