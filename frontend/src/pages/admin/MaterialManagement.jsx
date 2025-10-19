import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import "../../styles/MaterialManagement.css";
import pfp from "../../assets/pfp.png";
import { useNavigate } from "react-router-dom";
import api from "../../api";

const MaterialManagement = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    author: "",
    stock: "",
  });

  const navigate = useNavigate();

  // ✅ Load materials (books) from backend
  const loadBooks = async () => {
    try {
      const { data } = await api.get("/books");
      const items = (data || []).map((b) => ({
        id: b._id || b.id,
        type: (b.tags && b.tags[0]) || "Book",
        title: b.title,
        author: b.author,
        stock: b.availableCopies ?? b.totalCopies ?? 0,
      }));
      setMaterials(items);
    } catch (error) {
      console.error("Error loading books:", error);
      setMaterials([]);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // ✅ Add new book
  const handleAddBook = async () => {
    if (!formData.title || !formData.author) return;

    try {
      const body = {
        title: formData.title,
        author: formData.author,
        tags: formData.type ? [formData.type] : [],
        totalCopies: Number(formData.stock || 1),
      };
      await api.post("/books", body);
      setFormData({ type: "", title: "", author: "", stock: "" });
      setIsAddModalOpen(false);
      await loadBooks();
    } catch (error) {
      console.error("Error adding book:", error);
    }
  };

  // ✅ Edit existing book
  const handleEditBook = async () => {
    if (!selectedMaterial) return;

    try {
      const body = {
        title: formData.title || selectedMaterial.title,
        author: formData.author || selectedMaterial.author,
        tags: formData.type ? [formData.type] : selectedMaterial.tags,
        totalCopies: formData.stock
          ? Number(formData.stock)
          : selectedMaterial.stock,
      };
      await api.patch(`/books/${selectedMaterial.id}`, body);
      setIsEditModalOpen(false);
      setFormData({ type: "", title: "", author: "", stock: "" });
      await loadBooks();
    } catch (error) {
      console.error("Error editing book:", error);
    }
  };

  // ✅ Delete book
  const handleRemoveBook = async () => {
    if (!selectedMaterial) return;

    try {
      await api.delete(`/books/${selectedMaterial.id}`);
      setIsDeleteModalOpen(false);
      setSelectedMaterial(null);
      await loadBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    try {
      localStorage.removeItem("lr_token");
      localStorage.removeItem("lr_user");
    } catch {}
    setShowLogoutModal(false);
    setIsDropdownOpen(false);
    navigate("/signin", { replace: true });
  };

  return (
    <div className="material-page-container">
      <Sidebar />

      <div className="material-page-main">
        {/* ===== TOPBAR ===== */}
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

        {/* ===== MAIN CARD ===== */}
        <div className="material-card">
          <h2>Material Management</h2>
          <hr className="material-divider" />

          <div className="material-body-card">
            <div className="material-info-card">
              {/* ===== ACTION BUTTONS ===== */}
              <div className="button-row">
                <button className="add-btn" onClick={() => setIsAddModalOpen(true)}>
                  Add Book
                </button>
                <button
                  className="edit-btn"
                  disabled={!materials.length}
                  onClick={() => {
                    setSelectedMaterial(materials[0]);
                    setIsEditModalOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  disabled={!materials.length}
                  onClick={() => {
                    setSelectedMaterial(materials[0]);
                    setIsDeleteModalOpen(true);
                  }}
                >
                  Remove
                </button>
              </div>

              {/* ===== MATERIALS TABLE ===== */}
              <div className="user-table-wrapper">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Material Type</th>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Stock</th>
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

          {/* ===== ADD MODAL ===== */}
          {isAddModalOpen && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3>Add Book</h3>
                {["Type", "Title", "Author", "Stock"].map((field) => (
                  <React.Fragment key={field}>
                    <label>{field}</label>
                    <input
                      type={field === "Stock" ? "number" : "text"}
                      placeholder={field}
                      value={formData[field.toLowerCase()] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.toLowerCase()]: e.target.value,
                        })
                      }
                    />
                  </React.Fragment>
                ))}
                <div className="modal-actions">
                  <button onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                  <button className="save-btn" onClick={handleAddBook}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== EDIT MODAL ===== */}
          {isEditModalOpen && selectedMaterial && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3>Edit Book</h3>
                {["Type", "Title", "Author", "Stock"].map((field) => (
                  <React.Fragment key={field}>
                    <label>{field}</label>
                    <input
                      type={field === "Stock" ? "number" : "text"}
                      defaultValue={selectedMaterial[field.toLowerCase()]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.toLowerCase()]: e.target.value,
                        })
                      }
                    />
                  </React.Fragment>
                ))}
                <div className="modal-actions">
                  <button onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                  <button className="save-btn" onClick={handleEditBook}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== DELETE MODAL ===== */}
          {isDeleteModalOpen && selectedMaterial && (
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

      {/* ===== LOGOUT MODAL ===== */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-box pretty-modal">
            <h3 className="modal-title-green">Are you sure you want to logout?</h3>
            <div className="modal-actions center-actions">
              <button className="cancel-btn" onClick={() => setShowLogoutModal(false)}>
                Close
              </button>
              <button className="confirm-btn delete-btn" onClick={handleLogout}>
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
