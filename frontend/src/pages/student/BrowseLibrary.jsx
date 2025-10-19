import React from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import "../student/BrowseLibrary.css";

const BrowseLibrary = () => {
  const libraryItems = [
    { title: "Book 1", author: "Author 1", genre: "Genre 1" },
    { title: "Book 2", author: "Author 2", genre: "Genre 2" },
    { title: "Book 3", author: "Author 3", genre: "Genre 3" },
    { title: "Book 4", author: "Author 4", genre: "Genre 4" },
    { title: "Book 5", author: "Author 5", genre: "Genre 5" },
    { title: "Book 6", author: "Author 6", genre: "Genre 6" },
    { title: "Book 7", author: "Author 7", genre: "Genre 7" },
    { title: "Book 8", author: "Author 8", genre: "Genre 8" },
    { title: "Book 9", author: "Author 9", genre: "Genre 9" },
  ];

  const navigate = useNavigate(); // Initialize navigate function

  return (
    <div className="library-container">
      <div className="header-section">
        <a href="#" className="back-link" onClick={(e) => { e.preventDefault(); navigate("/student/dashboard"); }}>
          ←
        </a>
        <h1 className="header-title">Browse Library Material</h1>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
        />
        <button className="sort-button">Sort A-Z</button>
      </div>

      <div className="grid-section">
        {libraryItems.map((item, index) => (
          <div key={index} className="library-card">
            <div className="card-cover"></div>
            <div className="card-details">
              <p className="card-title">Title: {item.title}</p>
              <p className="card-author">Author: {item.author}</p>
              <p className="card-genre">Genre: {item.genre}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseLibrary;