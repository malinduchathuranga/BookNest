import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { cache } from '../../services/cache.js';
import { formatLKR } from '../../utils/currency.js';
import '../Pages.css';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = filter ? `?status=${filter}` : '';
      const response = await api.get(`/admin/orders/all${params}`);
      setOrders(response.data);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      // stock changes on cancel — clear book caches so UI reflects updated stock
      if (newStatus === 'Cancelled') cache.clear('home_books');
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update order');
    }
  };

  return (
    <div className="container">
      <section className="section">
        <h1>Manage Orders</h1>

        <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          <label>Filter by Status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}
          >
            <option value="">All</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : orders.length > 0 ? (
          <div>
            {orders.map(order => (
              <div
                key={order._id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <p><strong>Order ID:</strong> {order._id}</p>
                    <p><strong>Customer:</strong> {order.user?.name}</p>
                    <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p><strong>Total:</strong> {formatLKR(order.totalAmount)}</p>
                    <p><strong>Items:</strong> {order.items.length}</p>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <strong>Status:</strong>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    style={{ marginLeft: '1rem', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <p><strong>Delivery to:</strong> {order.deliveryDetails.name}</p>
                  <p>{order.deliveryDetails.address}, {order.deliveryDetails.city}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No orders found</p>
          </div>
        )}
      </section>
    </div>
  );
}