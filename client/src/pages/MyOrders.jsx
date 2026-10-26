import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Package, Upload, CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';
import api from '../services/api.js';
import { formatLKR } from '../utils/currency.js';

const ORDER_STATUS_COLORS = {
  Processing: 'bg-amber-100 text-amber-800',
  Shipped: 'bg-blue-100 text-blue-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-600',
};

const PAYMENT_STATUS_CONFIG = {
  'Not Required': { color: 'text-muted', icon: null, label: 'N/A' },
  'Pending Upload': { color: 'text-amber-700', icon: <Upload size={14} />, label: 'Upload Slip' },
  'Pending Verification': { color: 'text-blue-700', icon: <Clock size={14} />, label: 'Under Review' },
  'Verified': { color: 'text-green-700', icon: <CheckCircle size={14} />, label: 'Verified' },
  'Rejected': { color: 'text-red-600', icon: <XCircle size={14} />, label: 'Rejected' },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadError, setUploadError] = useState({});
  const fileInputRefs = useRef({});

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await api.put(`/orders/${orderId}/cancel`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel');
    }
  };

  const handleSlipUpload = async (orderId, file) => {
    if (!file) return;
    setUploadError(prev => ({ ...prev, [orderId]: '' }));

    if (file.size > 5 * 1024 * 1024) {
      setUploadError(prev => ({ ...prev, [orderId]: 'File too large. Max 5 MB.' }));
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setUploadError(prev => ({ ...prev, [orderId]: 'Only JPG, PNG, or PDF allowed.' }));
      return;
    }

    const formData = new FormData();
    formData.append('slip', file);

    try {
      setUploadingId(orderId);
      await api.post(`/payments/${orderId}/slip`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchOrders();
    } catch (err) {
      setUploadError(prev => ({ ...prev, [orderId]: err.response?.data?.error || 'Upload failed' }));
    } finally {
      setUploadingId(null);
    }
  };

  const viewSlip = (orderId) => {
    const token = localStorage.getItem('token');
    // Open in new tab via a fetch-triggered blob URL
    const url = `http://localhost:5000/api/payments/${orderId}/slip`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      })
      .catch(() => alert('Could not load slip'));
  };

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center text-muted">Loading...</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-ink sm:text-3xl sm:mb-8">My Orders</h1>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">{error}</p>}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-16 text-center">
          <Package size={48} className="mx-auto mb-4 text-muted opacity-30" />
          <p className="mb-4 text-muted">No orders yet</p>
          <Link to="/books" className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark transition">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const ps = PAYMENT_STATUS_CONFIG[order.paymentStatus] || PAYMENT_STATUS_CONFIG['Not Required'];
            const canUpload = order.paymentMethod === 'Bank Transfer' &&
              (order.paymentStatus === 'Pending Upload' || order.paymentStatus === 'Rejected');
            const hasSlip = order.paymentMethod === 'Bank Transfer' &&
              order.paymentStatus !== 'Pending Upload';

            return (
              <div key={order._id} className="rounded-xl border border-line bg-white p-6">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted mb-1">Order ID: {order._id}</p>
                    <p className="text-sm text-muted">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {order.status}
                    </span>
                    <span className="font-bold text-ink">{formatLKR(order.totalAmount)}</span>
                  </div>
                </div>

                <div className="mb-4 space-y-1 border-t border-line pt-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted">{item.title} × {item.quantity}</span>
                      <span>{formatLKR(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-line pt-4 text-sm text-muted mb-4">
                  <p className="font-medium text-ink">Delivery to:</p>
                  <p>{order.deliveryDetails.name} · {order.deliveryDetails.phone}</p>
                  <p>{order.deliveryDetails.address}, {order.deliveryDetails.city}</p>
                </div>

                {/* Payment section */}
                <div className="rounded-lg bg-page p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-muted">Payment: </span>
                      <span className="font-medium text-ink">{order.paymentMethod}</span>
                      {order.paymentStatus !== 'Not Required' && (
                        <span className={`ml-2 inline-flex items-center gap-1 font-medium ${ps.color}`}>
                          {ps.icon} {ps.label}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {hasSlip && (
                        <button
                          onClick={() => viewSlip(order._id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs hover:bg-white transition"
                        >
                          <ExternalLink size={13} /> View Slip
                        </button>
                      )}
                      {canUpload && (
                        <>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                            ref={el => fileInputRefs.current[order._id] = el}
                            onChange={e => handleSlipUpload(order._id, e.target.files[0])}
                          />
                          <button
                            onClick={() => fileInputRefs.current[order._id]?.click()}
                            disabled={uploadingId === order._id}
                            className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50 transition"
                          >
                            <Upload size={13} />
                            {uploadingId === order._id ? 'Uploading...' : order.paymentStatus === 'Rejected' ? 'Re-upload Slip' : 'Upload Slip'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Rejection reason */}
                  {order.paymentStatus === 'Rejected' && order.paymentSlip?.rejectionReason && (
                    <p className="mt-2 text-xs text-red-600">
                      <span className="font-semibold">Rejection reason:</span> {order.paymentSlip.rejectionReason}
                    </p>
                  )}

                  {uploadError[order._id] && (
                    <p className="mt-2 text-xs text-red-600">{uploadError[order._id]}</p>
                  )}
                </div>

                {order.status === 'Processing' && order.paymentStatus !== 'Verified' && order.paymentStatus !== 'Pending Verification' && (
                  <button
                    onClick={() => handleCancel(order._id)}
                    className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}