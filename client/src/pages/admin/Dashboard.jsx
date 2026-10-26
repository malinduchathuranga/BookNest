import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, ShoppingBag, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import '../Pages.css';
import { formatLKR } from '../../utils/currency.js';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (err) {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container loading">Loading...</div>;
  if (error) return <div className="container error-message">{error}</div>;

  const statCards = stats ? [
    { icon: BookOpen,    label: 'Total Books',     value: stats.totalBooks,               color: 'var(--accent-primary)' },
    { icon: Users,       label: 'Customers',       value: stats.totalCustomers,           color: '#6366f1' },
    { icon: ShoppingBag, label: 'Total Orders',    value: stats.totalOrders,              color: '#ea7c1a' },
    { icon: TrendingUp,  label: 'Total Sales',     value: formatLKR(stats.totalSales),    color: 'var(--success)' },
  ] : [];

  const statusColor = { Processing: '#ea7c1a', Shipped: '#6366f1', Delivered: 'var(--success)', Cancelled: 'var(--error)' };

  return (
    <div className="container">
      <section className="section">
        <h1 style={{ marginBottom: '1.75rem', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>Dashboard</h1>

        {stats && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
              {statCards.map(({ icon: Icon, label, value, color }) => (
                <div key={label} style={{ background: 'var(--bg-surface)', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: color + '18', borderRadius: '0.6rem', padding: '0.6rem', flexShrink: 0 }}>
                    <Icon size={22} color={color} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', fontWeight: 500 }}>{label}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h2 style={{ marginBottom: '1rem' }}>Recent Orders</h2>
              {stats.recentOrders?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map(order => (
                        <tr key={order._id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order._id.substring(0, 10)}…</td>
                          <td>{order.user.name}</td>
                          <td style={{ fontWeight: 600 }}>{formatLKR(order.totalAmount)}</td>
                          <td>
                            <span style={{ padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: (statusColor[order.status] || '#888') + '18', color: statusColor[order.status] || '#888' }}>
                              {order.status}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No orders yet</p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}