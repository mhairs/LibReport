import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar"; 
import "../../styles/BooksManagement.css"; 
import pfp from "../../assets/pfp.png"; 
import { useNavigate } from "react-router-dom";
import api from "../../api";

const BooksManagement = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [books, setBooks] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowLogoutModal(false);
    setIsDropdownOpen(false);
    navigate("/signin", { replace: true });
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const loadActiveLoans = async () => {
    try {
      const { data } = await api.get("/loans/active");
      const items = (data.items || []).map((it) => ({
        id: it._id,
        title: it.title,
        student: it.student,
        borrowed: it.borrowedAt
          ? new Date(it.borrowedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "-",
        due: it.dueAt
          ? new Date(it.dueAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "-",
        status: it.status || "On Time",
      }));
      setBooks(items);
    } catch (e) {
      setBooks([]);
    }
  };

  useEffect(() => {
    loadActiveLoans();
  }, []);

  const handleAction = (action, book) => {
    setSelectedBook(book);
    switch (action) {
      case "Mark as Returned":
        setActiveModal("return");
        break;
      case "Borrow Details":
      case "View History":
        setActiveModal("details");
        break;
      case "Delete Record":
        setActiveModal("delete");
        break;
      default:
        break;
    }
    setOpenDropdown(null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedBook(null);
  };

  const confirmReturn = async () => {
    try {
      await api.post("/loans/return", { loanId: selectedBook.id });
      await loadActiveLoans();
    } catch (e) {
      /* ignore for now */
    }
    closeModal();
  };

  const confirmDelete = () => {
    setBooks((prevBooks) => prevBooks.filter((b) => b.id !== selectedBook.id));
    closeModal();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "On Time":
        return "status-on-time";
      case "Overdue":
        return "status-overdue";
      case "Due Soon":
        return "status-due-soon";
      case "Renewed":
        return "status-renewed";
      case "Returned":
        return "status-returned";
      default:
        return "";
    }
  };

  const renderDropdownOptions = (status, book) => {
    switch (status) {
      case "On Time":
      case "Overdue":
        return (
          <>
            <button onClick={() => handleAction("Mark as Returned", book)}>
              Mark as Returned
            </button>
            <button onClick={() => handleAction("Borrow Details", book)}>
              Borrow Details
            </button>
            <button onClick={() => handleAction("Delete Record", book)}>
              Delete Record
            </button>
          </>
        );
      case "Returned":
        return (
          <>
            <button onClick={() => handleAction("Borrow Details", book)}>
              Borrow Details
            </button>
            <button onClick={() => handleAction("Delete Record", book)}>
              Delete Record
            </button>
          </>
        );
      default:
        return null;
    }
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

        <div className="book-card">
          <h2>Books Management</h2>
          <hr className="book-divider" />
          <div className="book-body-card">
            <div className="book-info-card">
              <div className="books-table">
                <table>
                  <thead>
                    <tr>
                      <th>Book Title</th>
                      <th>Student Name</th>
                      <th>Date Borrowed</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => (
                      <tr key={book.id}>
                        <td>{book.title}</td>
                        <td>{book.student}</td>
                        <td>{book.borrowed}</td>
                        <td>{book.due}</td>
                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              book.status
                            )}`}
                          >
                            {book.status}
                          </span>
                        </td>
                        <td>
                          <div className="dropdown-wrapper">
                            <button
                              onClick={() => toggleDropdown(book.id)}
                              className="dropdown-btn"
                            >
                              ▼
                            </button>
                            {openDropdown === book.id && (
                              <div className="dropdown-menu">
                                {renderDropdownOptions(book.status, book)}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeModal && selectedBook && (
        <div className="modal-overlay">
          <div className="modal-box pretty-modal">
            {activeModal === "return" && (
              <>
                <h3 className="modal-title-green">
                  Mark this book as returned?
                </h3>
                <div className="modal-field">
                  <label>Book Title</label>
                  <input type="text" value={selectedBook.title} readOnly />
                </div>
                <div className="modal-field">
                  <label>Student Name</label>
                  <input type="text" value={selectedBook.student} readOnly />
                </div>
                <div className="modal-actions center-actions">
                  <button className="cancel-btn" onClick={closeModal}>
                    Cancel
                  </button>
                  <button className="confirm-btn" onClick={confirmReturn}>
                    Confirm
                  </button>
                </div>
              </>
            )}

            {activeModal === "details" && (
              <>
                <h3 className="modal-title-green">Borrow Details</h3>
                <div className="modal-field">
                  <label>Book Title</label>
                  <input type="text" value={selectedBook.title} readOnly />
                </div>
                <div className="modal-field">
                  <label>Student Name</label>
                  <input type="text" value={selectedBook.student} readOnly />
                </div>
                <div className="modal-field">
                  <label>Date Borrowed</label>
                  <input type="text" value={selectedBook.borrowed} readOnly />
                </div>
                <div className="modal-field">
                  <label>Due Date</label>
                  <input type="text" value={selectedBook.due} readOnly />
                </div>
                <div className="modal-field">
                  <label>Status</label>
                  <input type="text" value={selectedBook.status} readOnly />
                </div>
                <div className="modal-actions center-actions">
                  <button className="cancel-btn" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </>
            )}

            {activeModal === "delete" && (
              <>
                <h3 className="modal-title-green">Delete this record?</h3>
                <div className="modal-field">
                  <label>Book Title</label>
                  <input type="text" value={selectedBook.title} readOnly />
                </div>
                <div className="modal-field">
                  <label>Student Name</label>
                  <input type="text" value={selectedBook.student} readOnly />
                </div>
                <div className="modal-actions center-actions">
                  <button className="cancel-btn" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className="confirm-btn delete-btn"
                    onClick={confirmDelete}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-box pretty-modal">
            <h3 className="modal-title-green">
              Are you sure you want to logout?
            </h3>
            <div className="modal-actions center-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowLogoutModal(false)}
              >
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

export default BooksManagement;
