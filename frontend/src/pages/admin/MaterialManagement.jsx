<<<<<<< HEAD:frontend/src/pages/admin/MaterialManagement.jsx
import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
=======
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
>>>>>>> e9595b6ac88f7a77fe4bfd0ad26048319c9e3035:frontend/src/pages/MaterialManagement.jsx
import "../styles/MaterialManagement.css";
import pfp from "../assets/pfp.png";
import { useNavigate } from "react-router-dom";
import api from "../api";

const MaterialManagement = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);

  const [formData, setFormData] = useState({
    type: "",
    title: "",
    author: "",
    stock: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.placeholder.toLowerCase()]: e.target.value });
  };

  const loadBooks = async () => {
    try {
      const { data } = await api.get('/books');
      const items = (data || []).map(b => ({
        id: b._id || b.id,
        type: (b.tags && b.tags[0]) || 'Book',
        title: b.title,
        author: b.author,
        stock: b.availableCopies ?? b.totalCopies ?? 0,
      }));
      setMaterials(items);
    } catch { setMaterials([]); }
  };

  useEffect(() => { loadBooks(); }, []);

  const handleAddBook = async () => {
    if (!formData.title || !formData.author) return;
    try {
      const body = {
        title: formData.title,
        author: formData.author,
        tags: formData.type ? [formData.type] : [],
        totalCopies: Number(formData.stock || 1),
      };
      await api.post('/books', body);
      setFormData({ type: "", title: "", author: "", stock: "" });
      setIsAddModalOpen(false);
      await loadBooks();
    } catch (e) {}
  };

  const handleEditBook = async () => {
    if (!selectedMaterial) return;
    try {
      const body = {
        title: formData.title || selectedMaterial.title,
        author: formData.author || selectedMaterial.author,
        tags: formData.type ? [formData.type] : undefined,
        totalCopies: formData.stock ? Number(formData.stock) : undefined,
      };
      await api.patch(`/books/${selectedMaterial.id}`, body);
      setIsEditModalOpen(false);
      setFormData({ type: "", title: "", author: "", stock: "" });
      await loadBooks();
    } catch (e) {}
  };

  const handleRemoveBook = async () => {
    if (!selectedMaterial) return;
    try { await api.delete(`/books/${selectedMaterial.id}`); } catch (e) {}
    setIsDeleteModalOpen(false);
    setSelectedMaterial(null);
    await loadBooks();
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    setIsDropdownOpen(false); try { localStorage.removeItem('lr_token'); try { localStorage.removeItem('lr_user'); } catch {} } catch {}
    navigate("/signin", { replace: true });
  };

  return (
    <div className="material-page-container">
      <Sidebar />

      <div className="material-page-main">
        <div className="material-topbar">
          <div
            className="profile-container"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="profile-circle">
              <img src={pfp} alt="Profile" />
            </div>

            {isDropdownOpen && (
              <div className="profile-dropdown">
                <button onClick={() => setShowLogoutModal(true)}>Logout</button>
              </div>
            )}
          </div>
        </div>
        <div className="material-card">
          <h2>Material Management</h2>
          <hr className="material-divider" />
          <div className="material-body-card">
            <div className="material-info-card">
              <div className="button-row">
                <button className="add-btn" onClick={() => setIsAddModalOpen(true)}>
                  Add Book
                </button>
                <button
                  className="edit-btn"
                  onClick={() => {
                    const firstItem = materials[0];
                    setSelectedMaterial(firstItem);
                    setIsEditModalOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => {
                    const firstItem = materials[0];
                    setSelectedMaterial(firstItem);
                    setIsDeleteModalOpen(true);
                  }}
                >
                  Remove
                </button>
              </div>

              {/* ✅ Table */}
              <div className="user-table-wrapper">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>MATERIAL TYPE</th>
                      <th>TITLE</th>
                      <th>AUTHOR</th>
                      <th>STOCK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((mat) => (
                      <tr key={mat.id}>
                        <td>{mat.type}</td>
                        <td>{mat.title}</td>
                        <td>{mat.author}</td>
                        <td>{mat.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/*Add Modal */}
          {isAddModalOpen && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3>Add Book</h3>
                <label>Material Type</label>
                <input
                  type="text"
                  placeholder="Type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                />
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <label>Author</label>
                <input
                  type="text"
                  placeholder="Author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
                <label>Stock</label>
                <input
                  type="number"
                  placeholder="Stock"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
                <div className="modal-actions">
                  <button onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                  <button className="save-btn" onClick={handleAddBook}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/*Edit Modal */}
          {isEditModalOpen && selectedMaterial && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3>Edit Book</h3>
                <label>Material Type</label>
                <input
                  type="text"
                  defaultValue={selectedMaterial.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                />
                <label>Title</label>
                <input
                  type="text"
                  defaultValue={selectedMaterial.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <label>Author</label>
                <input
                  type="text"
                  defaultValue={selectedMaterial.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
                <label>Stock</label>
                <input
                  type="number"
                  defaultValue={selectedMaterial.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
                <div className="modal-actions">
                  <button onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                  <button className="save-btn" onClick={handleEditBook}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/*Delete Confirmation Modal */}
          {isDeleteModalOpen && (
            <div className="modal-overlay">
              <div className="modal-box small">
                <h3>Are you sure you want to remove this?</h3>
                <p style={{ textAlign: "center", marginBottom: "10px", color: "#555" }}>
                  This action cannot be undone.
                </p>
                <div className="modal-actions">
                  <button onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                  <button className="delete-confirm-btn" onClick={handleRemoveBook}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-box pretty-modal">
            <h3 className="modal-title-green">Are you sure you want to logout?</h3>

            <div className="modal-actions center-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowLogoutModal(false)}
              >
                Close
              </button>
              <button
                className="confirm-btn delete-btn"
                onClick={handleLogout}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialManagement;


