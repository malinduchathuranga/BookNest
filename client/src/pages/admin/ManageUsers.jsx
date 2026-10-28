import React, { useState, useEffect } from 'react';
import { Trash2, ShieldCheck, ShieldOff, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import '../Pages.css';

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (q = '') => {
    try {
      setLoading(true);
      setError('');
      const params = q ? `?search=${encodeURIComponent(q)}` : '';
      const res = await api.get(`/admin/users${params}`);
      setUsers(res.data);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    setActionLoading(userId + '-role');
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? res.data : u));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    setActionLoading(userId + '-del');
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setActionLoading(null);
      setConfirmDelete(null);
    }
  };

  const roleBadge = (role) => ({
    padding: '0.2rem 0.65rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 600,
    background: role === 'admin' ? 'var(--accent-primary, #6366f1)18' : 'var(--success, #22c55e)18',
    color: role === 'admin' ? 'var(--accent-primary, #6366f1)' : 'var(--success, #22c55e)',
  });

  return (
    <div className="container">
      <section className="section">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', margin: 0 }}>Manage Users</h1>
          <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', width: '100%', maxWidth: '480px' }}>
            <div style={{ position: 'relative', flex: '1 1 160px', minWidth: 0 }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '2.25rem', paddingRight: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>Search</button>
            {search && (
              <button type="button" onClick={() => { setSearch(''); fetchUsers(''); }} className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>Clear</button>
            )}
          </form>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

        {loading ? (
          <div className="loading">Loading users…</div>
        ) : users.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No users found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="hide-mobile">Email</th>
                  <th>Role</th>
                  <th className="hide-mobile">Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ opacity: actionLoading?.startsWith(u._id) ? 0.5 : 1 }}>
                    <td style={{ fontWeight: 500 }}>{u.name}{u._id === currentUser?._id && <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>(you)</span>}</td>
                    <td className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{u.email}</td>
                    <td><span style={roleBadge(u.role)}>{u.role}</span></td>
                    <td className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {u._id !== currentUser?._id && (
                          <>
                            <button
                              onClick={() => handleRoleToggle(u._id, u.role)}
                              disabled={!!actionLoading}
                              title={u.role === 'admin' ? 'Demote to customer' : 'Promote to admin'}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: u.role === 'admin' ? 'var(--text-secondary)' : '#6366f1', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
                            >
                              {u.role === 'admin' ? <><ShieldOff size={14} /> Demote</> : <><ShieldCheck size={14} /> Make Admin</>}
                            </button>
                            {confirmDelete === u._id ? (
                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                <button
                                  onClick={() => handleDelete(u._id)}
                                  disabled={!!actionLoading}
                                  style={{ padding: '0.35rem 0.75rem', borderRadius: 'var(--radius)', border: 'none', background: 'var(--error, #ef4444)', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                                >Confirm</button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  style={{ padding: '0.35rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.8rem' }}
                                >Cancel</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(u._id)}
                                disabled={!!actionLoading}
                                title="Delete user"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--error, #ef4444)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}