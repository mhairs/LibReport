import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(null); // { uid, token }
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const { data } = await api.post('/auth/request-reset', { email });
      setSent({ uid: data.uid, token: data.token });
    } catch (err) {
      setError(err?.response?.data?.error || 'Request failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
      <div className="auth-right" style={{maxWidth:420, width:'100%', background:'#fff', padding:24, borderRadius:12}}>
        <h2>Forgot Password</h2>
        <p>Enter your email to receive a reset link.</p>
        {error && <div style={{color:'#b00020', marginBottom:8}}>{error}</div>}
        {!sent && (
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</button>
            <p className="extra-links" style={{marginTop:12}}><Link to="/signin">Back to Sign In</Link></p>
          </form>
        )}
        {sent && (
          <div>
            <p>Reset token generated. For this demo, click the button below to continue:</p>
            <button className="btn" onClick={()=> navigate(`/reset?uid=${encodeURIComponent(sent.uid)}&token=${encodeURIComponent(sent.token)}`)}>Continue to Reset</button>
            <p className="extra-links" style={{marginTop:12}}><Link to="/signin">Back to Sign In</Link></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

