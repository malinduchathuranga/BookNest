import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import api from '../../services/api.js';
import { formatLKR } from '../../utils/currency.js';
import '../Pages.css';

export default function PaymentVerification() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [pendingChange, setPendingChange] = useState({}); // { orderId: { status, reason } }

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/admin/pending');
      setOrders(res.data);
    } catch {
      setError('Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, status, reason) => {
    if (status === 'Rejected' && !reason?.trim()) {
      alert('Please enter a rejection reason');
      return;
    }
    if (!window.confirm(`Set payment status to "${status}"?`)) return;
    try {
      setActionLoading(orderId);
      await api.put(`/payments/${orderId}/status`, { status, reason });
      setPendingChange(prev => { const n = { ...prev }; delete n[orderId]; return n; });
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const viewSlip = (orderId) => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5000/api/payments/${orderId}/slip`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => window.open(URL.createObjectURL(blob), '_blank'))
      .catch(() => alert('Could not load slip'));
  };

return (
    <div className="container">
      <section className="section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Clock size={24} color="var(--accent-primary)" />
          <h1 style={{ margin: 0 }}>Payment Verification</h1>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <p>No payments found</p>
          </div>
        ) : (
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {orders.length} order{orders.length !== 1 ? 's' : ''} requiring attention.
              Verify only after confirming the actual bank transaction.
            </p>
            {orders.map(order => (
              <div key={order._id} style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Order ID</p>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', wordBreak: 'break-all' }}>{order._id}</p>
                    <span style={{
                      display: 'inline-block', marginTop: '0.25rem',
                      padding: '0.15rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                      background: order.paymentStatus === 'Rejected' ? '#fee2e2' : order.paymentStatus === 'Verified' ? '#dcfce7' : '#fef9c3',
                      color: order.paymentStatus === 'Rejected' ? '#dc2626' : order.paymentStatus === 'Verified' ? '#16a34a' : '#92400e'
                    }}>
                      {order.paymentStatus}
                    </span>
                    {order.paymentStatus === 'Rejected' && order.paymentSlip?.rejectionReason && (
                      <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                        Reason: {order.paymentSlip.rejectionReason}
                      </p>
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Customer</p>
                    <p style={{ fontWeight: 600 }}>{order.user?.name}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{order.user?.email}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Order Total</p>
                    <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{formatLKR(order.totalAmount)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Slip Uploaded</p>
                    <p style={{ fontSize: '0.875rem' }}>
                      {order.paymentSlip?.uploadedAt
                        ? new Date(order.paymentSlip.uploadedAt).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Items:</p>
                  {order.items.map((item, i) => (
                    <p key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {item.title} × {item.quantity} = {formatLKR(item.unitPrice * item.quantity)}
                    </p>
                  ))}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <button className="btn-sm btn-secondary" onClick={() => viewSlip(order._id)}>
                    <ExternalLink size={14} style={{ marginRight: '0.25rem' }} /> View Slip
                  </button>

                  <select
                    value={pendingChange[order._id]?.status ?? order.paymentStatus}
                    onChange={e => setPendingChange(prev => ({ ...prev, [order._id]: { status: e.target.value, reason: '' } }))}
                    style={{ padding: '0.4rem 0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}
                  >
                    <option value="Pending Verification">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  {pendingChange[order._id]?.status === 'Rejected' && (
                    <input
                      type="text"
                      value={pendingChange[order._id]?.reason || ''}
                      onChange={e => setPendingChange(prev => ({ ...prev, [order._id]: { ...prev[order._id], reason: e.target.value } }))}
                      placeholder="Rejection reason (required)"
                      style={{ padding: '0.4rem 0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem', fontSize: '0.875rem', minWidth: '200px' }}
                    />
                  )}

                  {pendingChange[order._id] && pendingChange[order._id].status !== order.paymentStatus && (
                    <button
                      className="btn-sm"
                      style={{ background: 'var(--accent-primary)', color: 'white' }}
                      onClick={() => handleStatusChange(order._id, pendingChange[order._id].status, pendingChange[order._id].reason)}
                      disabled={actionLoading === order._id}
                    >
                      {actionLoading === order._id ? 'Saving...' : 'Save'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}