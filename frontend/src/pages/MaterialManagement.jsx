import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/MaterialManagement.css";
import pfp from "../assets/pfp.png";
import { useNavigate } from "react-router-dom";

const MaterialManagement = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([
    { id: 1, type: "Book", title: "The Art of Code", author: "John Doe", stock: 12 },
  ]);

  const [formData, setFormData] = useState({
    type: "",
    title: "",
    author: "",
    stock: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.placeholder.toLowerCase()]: e.target.value });
  };

  const handleAddBook = () => {
    if (!formData.title || !formData.author || !formData.stock) return;
    const newMaterial = {
      id: materials.length + 1,
      type: formData.type || "Book",
      title: formData.title,
      author: formData.author,
      stock: parseInt(formData.stock),
    };
    setMaterials([...materials, newMaterial]);
    setFormData({ type: "", title: "", author: "", stock: "" });
    setIsAddModalOpen(false);
  };

  const handleEditBook = () => {
    if (!selectedMaterial) return;
    const updatedList = materials.map((m) =>
      m.id === selectedMaterial.id ? { ...selectedMaterial, ...formData } : m
    );
    setMaterials(updatedList);
    setIsEditModalOpen(false);
    setFormData({ type: "", title: "", author: "", stock: "" });
  };

  const handleRemoveBook = () => {
    if (!selectedMaterial) return;
    setMaterials(materials.filter((m) => m.id !== selectedMaterial.id));
    setIsDeleteModalOpen(false);
    setSelectedMaterial(null);
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    setIsDropdownOpen(false);
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
