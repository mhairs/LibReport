import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../student/BooksBorrowed.css";



const BooksBorrowed = () => {
  const navigate = useNavigate();

  // eme lang to, memalagay lang :P
  const books = [
    {
      title: "Data Structures & Algorithms",
      dateBorrowed: "September 25, 2025",
      dueDate: "October 15, 2025",
      status: "On Time",
    },
    {
      title: "Network Security",
      dateBorrowed: "September 25, 2025",
      dueDate: "October 15, 2025",
      status: "Overdue",
    },
    {
      title: "Introduction to Programming",
      dateBorrowed: "September 25, 2025",
      dueDate: "October 15, 2025",
      status: "Returned",
    },
  ];

  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [newDueDate, setNewDueDate] = useState("");

  // openmodal
  const openModal = (book) => {
    setSelectedBook(book);
    setNewDueDate(""); // Reset new due date
    setIsModalOpen(true);
  };

  // clsoemodal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
    setNewDueDate("");
  };

  // renew confirmation
  const handleRenew = () => {
    if (newDueDate) {
      console.log(`Renewing ${selectedBook.title} with new due date: ${newDueDate}`);
      // logic
      closeModal();
    } else {
      alert("Please select a new due date.");
    }
  };

  return (
    <div className="books-borrowed-container">
      <div className="header-section">
        <a href="#" className="back-link" onClick={(e) => { e.preventDefault(); navigate("/student/dashboard"); }}>
          ←
        </a>
        <h1 className="header-title">Browse Library Material</h1>
      </div>
      <table className="books-table">
        <thead>
          <tr>
            <th>Book Title</th>
            <th>Date Borrowed</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book, index) => (
            <tr key={index}>
              <td>{book.title}</td>
              <td>{book.dateBorrowed}</td>
              <td>{book.dueDate}</td>
              <td>
                <span className={`status ${book.status.toLowerCase().replace(" ", "-")}`}>
                  {book.status}
                </span>
              </td>
              <td>
                {book.status === "On Time" && (
                  <button
                    className="action-button renew"
                    onClick={() => openModal(book)}
                  >
                    Renew
                  </button>
                )}
                {book.status !== "Returned" && (
                  <button className="action-button view">View</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Renew */}
      {isModalOpen && selectedBook && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Renew Book</h2>
            <div className="modal-field">
              <label>Book Title</label>
              <p>{selectedBook.title}</p>
            </div>
            <div className="modal-field">
              <label>Current Due Date</label>
              <p>{selectedBook.dueDate}</p>
            </div>
            <div className="modal-field">
              <label>New Due Date</label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="date-picker"
                min={new Date().toISOString().split("T")[0]} // Prevent past dates
              />
            </div>
            <div className="modal-actions">
              <button className="action-button cancel" onClick={closeModal}>
                Cancel
              </button>
              <button className="action-button confirm" onClick={handleRenew}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksBorrowed;