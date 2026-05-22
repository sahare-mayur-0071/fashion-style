import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';

const Stock = () => {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', image: '', category: '', gender: '', season: '', stock: 20
  });
  const [editId, setEditId] = useState(null);

  const fetchStock = async () => {
    try {
      const res = await adminApi.get(`/stock?page=${page}&limit=50&search=${encodeURIComponent(searchTerm)}`);
      // Update logic since backend now returns pagination object
      if (res.data.outfits) {
        setOutfits(res.data.outfits);
        setTotalPages(res.data.totalPages);
        setTotalItems(res.data.total);
      } else {
        // Fallback if backend wasn't updated
        setOutfits(res.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStock();
  }, [page, searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(1); // Reset to first page on new search
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleOpenModal = (outfit = null) => {
    // If outfit is passed from the onClick, it's an object. 
    // Need to make sure we don't accidentally receive a React event object
    if (outfit && outfit._id) {
      setEditId(outfit._id);
      setFormData({
        title: outfit.title || '', 
        description: outfit.description || '', 
        price: outfit.price || '',
        image: outfit.image || '', 
        category: outfit.category || '', 
        gender: outfit.gender || '', 
        season: outfit.season || '',
        stock: outfit.stock !== undefined ? outfit.stock : 20
      });
    } else {
      setEditId(null);
      setFormData({ title: '', description: '', price: '', image: '', category: '', gender: '', season: '', stock: 20 });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting stock form:", formData);
    try {
      if (editId) {
        await adminApi.put(`/stock/${editId}`, formData);
      } else {
        await adminApi.post('/stock', formData);
      }
      fetchStock();
      handleCloseModal();
      alert("Stock successfully saved!");
    } catch (err) {
      console.error("Error saving stock:", err);
      alert("Error saving stock: " + (err.response?.data?.message || err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await adminApi.delete(`/stock/${id}`);
        fetchStock();
        alert("Item deleted!");
      } catch (err) {
        console.error("Error deleting stock:", err);
        alert("Error deleting stock: " + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) return <div>Loading stock data...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>
          Stock Management <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>({totalItems} items)</span>
        </h2>
        
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flex: '1', maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="Search by title, category, gender..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="auth-input"
            style={{ marginBottom: 0, background: '#fff' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Search</button>
        </form>

        <button type="button" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => handleOpenModal()}>
          <FaPlus /> Add New Item
        </button>
      </div>
      
      <div className="admin-table-container glass animate-fade-in">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Gender</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {outfits.map(outfit => (
              <tr key={outfit._id}>
                <td>
                  <img src={outfit.image} alt={outfit.title} style={{ width: '50px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                </td>
                <td style={{ fontWeight: 600 }}>{outfit.title}</td>
                <td>{outfit.category}</td>
                <td>{outfit.gender}</td>
                <td>₹{outfit.price}</td>
                <td>
                  <span style={{ 
                    color: outfit.stock === 0 ? '#ff4757' : outfit.stock <= 10 ? '#ffa502' : '#2ed573',
                    fontWeight: 'bold'
                  }}>
                    {outfit.stock}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" style={{ background: 'none', border: 'none', color: '#000000', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => handleOpenModal(outfit)}>
                      <FaEdit />
                    </button>
                    <button type="button" style={{ background: 'none', border: 'none', color: '#ff4757', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => handleDelete(outfit._id)}>
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button 
            className="btn-outline" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
            Page {page} of {totalPages}
          </span>
          <button 
            className="btn-outline" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div className="animate-fade-in" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
        }}>
          <div className="glass" style={{
            width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto',
            background: 'var(--bg-color)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ color: '#000000', margin: 0 }}>{editId ? 'Edit Outfit' : 'Add New Outfit'}</h3>
              <button type="button" onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Title</label>
                <input type="text" name="title" className="auth-input" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Description</label>
                <textarea name="description" className="auth-input" value={formData.description} onChange={handleChange} required rows="3"></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Price (₹)</label>
                  <input type="number" name="price" className="auth-input" value={formData.price} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Stock Qty</label>
                  <input type="number" name="stock" className="auth-input" value={formData.stock} onChange={handleChange} required min="0" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Image URL</label>
                <input type="text" name="image" className="auth-input" value={formData.image} onChange={handleChange} required placeholder="/images/my-image.jpg or http://..." />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Category</label>
                  <input type="text" name="category" placeholder="e.g. Casual, Formal" className="auth-input" value={formData.category} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Gender</label>
                  <select name="gender" className="auth-input" value={formData.gender} onChange={handleChange} required style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
                    <option value="">Select Gender</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Season</label>
                  <select name="season" className="auth-input" value={formData.season} onChange={handleChange} required style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
                    <option value="">Select Season</option>
                    <option value="Summer">Summer</option>
                    <option value="Winter">Winter</option>
                    <option value="Rainy">Rainy</option>
                    <option value="All">All</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary w-100">
                {editId ? 'Update Item' : 'Add Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;
