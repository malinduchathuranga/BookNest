import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { formatLKR } from '../utils/currency.js';

export default function Checkout() {
  const { cart, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [bankDetails, setBankDetails] = useState(null);
  const [form, setForm] = useState({ name: user?.name || '', phone: '', address: '', city: '' });

  useEffect(() => {
    api.get('/admin/bank-details').then(res => setBankDetails(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.phone || !form.address || !form.city) {
      setError('All fields are required');
      return;
    }
    try {
      setLoading(true);
      await api.post('/orders', {
        items: cart.map(item => ({ bookId: item.bookId, quantity: item.quantity })),
        deliveryDetails: form,
        paymentMethod
      });
      clearCart();
      navigate('/my-orders');
    } catch (err) {
      setError(err.response?.data?.error || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-muted">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold text-ink">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Delivery */}
          <div className="rounded-xl border border-line bg-white p-6">
            <h2 className="mb-5 font-bold text-ink text-lg">Delivery Information</h2>
            {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
            <div className="space-y-4">
              {[
                { label: 'Full Name', name: 'name', type: 'text' },
                { label: 'Phone Number', name: 'phone', type: 'tel' },
                { label: 'City', name: 'city', type: 'text' },
              ].map(field => (
                <div key={field.name}>
                  <label className="mb-1 block text-sm font-medium text-ink">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-line p-3 text-sm focus:outline-none focus:border-brand"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Address</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full rounded-lg border border-line p-3 text-sm focus:outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-xl border border-line bg-white p-6">
            <h2 className="mb-4 font-bold text-ink text-lg">Payment Method</h2>
            <div className="space-y-3">
              {['Cash on Delivery', 'Bank Transfer'].map(method => (
                <label key={method} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${paymentMethod === method ? 'border-brand bg-brand/5' : 'border-line hover:border-brand/50'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="mt-0.5 accent-brand"
                  />
                  <div>
                    <p className="font-medium text-ink">{method}</p>
                    <p className="text-xs text-muted">
                      {method === 'Cash on Delivery' ? 'Pay when your order arrives' : 'Transfer to our bank account and upload your slip'}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {/* Bank details shown when Bank Transfer selected */}
            {paymentMethod === 'Bank Transfer' && bankDetails && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
                <p className="mb-2 font-semibold text-amber-800">Bank Transfer Instructions</p>
                <p className="text-amber-900">Transfer the total amount to the following account, then upload your payment slip on the orders page.</p>
                <div className="mt-3 space-y-1 rounded-lg bg-white p-3 text-ink">
                  <p><span className="font-medium">Bank:</span> {bankDetails.bankName}</p>
                  <p><span className="font-medium">Account Name:</span> {bankDetails.accountName}</p>
                  <p><span className="font-medium">Account Number:</span> {bankDetails.accountNumber}</p>
                  <p><span className="font-medium">Branch:</span> {bankDetails.branch}</p>
                </div>
                <p className="mt-2 text-xs text-amber-700">⚠️ Your order will be processed after payment verification by our team.</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-50 transition"
          >
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </form>

        {/* Summary */}
        <div className="h-fit rounded-xl border border-line bg-white p-6 space-y-4">
          <h2 className="font-bold text-ink text-lg">Order Summary</h2>
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.bookId} className="flex justify-between text-sm">
                <span className="text-muted">{item.title} × {item.quantity}</span>
                <span className="font-medium">{formatLKR(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-line pt-3 flex justify-between font-bold text-ink">
            <span>Total</span>
            <span>{formatLKR(getTotalPrice())}</span>
          </div>
          <p className="text-xs text-muted">Payment: {paymentMethod}</p>
        </div>
      </div>
    </div>
  );
}
