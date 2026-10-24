import React, { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import api from '../../services/api.js';
import { cache } from '../../services/cache.js';
import { formatLKR } from '../../utils/currency.js';
import '../Pages.css';

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    imageUrl: '',
    category: '',
    stock: ''
  });

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/books?limit=100');
      setBooks(response.data.books);
    } catch (err) {
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const closeModal = () => {
    setShowForm(false);
    setEditingId(null);
    setError('');
    setFormData({ title: '', author: '', description: '', price: '', imageUrl: '', category: '', stock: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        await api.put(`/books/${editingId}`, formData);
      } else {
        await api.post('/books', formData);
      }
      cache.clear('home_books');
      if (editingId) cache.clear(`book_${editingId}`);
      fetchBooks();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save book');
    }
  };

  const handleEdit = (book) => {
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      price: book.price,
      imageUrl: book.imageUrl,
      category: book.category._id,
      stock: book.stock
    });
    setEditingId(book._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      await api.delete(`/books/${id}`);
      cache.clear('home_books');
      cache.clear(`book_${id}`);
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete book');
    }
  };

  return (
    <div className="container">
      <section className="section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0 }}>Manage Books</h1>
          <button className="primary" onClick={() => { setShowForm(true); setEditingId(null); setFormData({ title: '', author: '', description: '', price: '', imageUrl: '', category: '', stock: '' }); }}>
            + Add New Book
          </button>
        </div>

        {/* Modal overlay */}
        {showForm && (
          <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-surface)', borderRadius: '0.75rem', padding: '2rem', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>{editingId ? 'Edit Book' : 'Add New Book'}</h2>
                <button onClick={closeModal} style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', padding: '0.25rem 0.5rem' }}>✕</button>
              </div>

              <form onSubmit={handleSubmit}>
                {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

                <div className="form-group">
                  <label>Title</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Author</label>
                  <input type="text" name="author" value={formData.author} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Price</label>
                    <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} required>
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-sm btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="primary">{editingId ? 'Update Book' : 'Add Book'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : books.length > 0 ? (
          <div className="table-responsive" style={{ marginTop: '1.5rem' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book._id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{formatLKR(book.price)}</td>
                    <td>{book.stock}</td>
                    <td>{book.category?.name}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-sm" onClick={() => handleEdit(book)}>
                          <Edit size={16} /> Edit
                        </button>
                        <button className="btn-sm btn-danger" onClick={() => handleDelete(book._id)}>
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No books found</p>
          </div>
        )}
      </section>
    </div>
  );
}
