import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const uid = params.get('uid') || '';
  const token = params.get('token') || '';
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (pw1 !== pw2) { setError('Passwords do not match'); return; }
    try {
      setLoading(true);
      await api.post('/auth/reset', { uid, token, newPassword: pw1 });
      setOk(true);
      setTimeout(()=> navigate('/signin'), 1200);
    } catch (err) {
      setError(err?.response?.data?.error || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
      <div className="auth-right" style={{maxWidth:420, width:'100%', background:'#fff', padding:24, borderRadius:12}}>
        <h2>Reset Password</h2>
        <p>Enter a new password for your account.</p>
        {error && <div style={{color:'#b00020', marginBottom:8}}>{error}</div>}
        {ok ? (
          <div>Success! Redirecting to sign in…</div>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={pw1} onChange={e=>setPw1(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} required />
            </div>
            <button type="submit" className="btn" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
            <p className="extra-links" style={{marginTop:12}}><Link to="/signin">Back to Sign In</Link></p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

