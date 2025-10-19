import React from "react";
import "../student/StudentCard";

const StudentCard = ({ icon, title }) => {
  return (
    <div className="student-card">
      <img src={icon} alt={title} className="student-card-icon" />
      <p className="student-card-title">{title}</p>
    </div>
  );
};

export default StudentCard;
