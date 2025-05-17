import React from "react";

const StudentInfoModal = ({ isOpen, onClose, onEdit, student, onActivity }) => {
    if (!isOpen || !student) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Информация о студенте</h2>
                <div className="student-info">
                    <p>
                        <strong>ФИО:</strong> {student.lastName} {student.firstName} {student.middleName}
                    </p>
                    <p>
                        <strong>Группа:</strong> {student.group?.name || "Не указана"}
                    </p>
                    <p>
                        <strong>Номер студ. билета:</strong> {student.studentId || "Не указан"}
                    </p>
                    <p>
                        <strong>Специальность:</strong> {student.specialty?.name || "Не указана"}
                    </p>
                </div>
                <div className="modal-buttons">
                    {/* <button className="activity-btn" onClick={onActivity}>
                        Активность
                    </button> */}
                    <button className="save-btn" onClick={onEdit}>
                        Редактировать
                    </button>
                    <button className="close-btn" onClick={onClose}>
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentInfoModal;