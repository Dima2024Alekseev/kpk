import React, { useState, useEffect } from "react";
import "./student.css";
import { Helmet } from "react-helmet";
import ExcelExporter from "../../utils/ExcelExporter";
import edit from "../../img/edit.svg";
import delete_ from "../../img/delete.svg";
import Header from "../../Components/Header/Header";
import studentPage from "../../img/studentPage/profile-2user.svg";
import save from "../../img/studentPage/save.svg";
import search from "../../img/search-icon.svg";
import { FaFileExcel, FaUserPlus } from 'react-icons/fa';
import { GrDocumentExcel } from "react-icons/gr";
import StudentInfoModal from "../../Components/Modal_Student/StudentInfoModal";
import EditStudentModal from "../../Components/Modal_Student/EditStudentModal";
import AddStudentModal from "../../Components/Modal_Student/AddStudentModal";
import Pagination from "../../Components/Pagination";

const Students = () => {
  const [directions, setDirections] = useState([]);
  const [selectedDirection, setSelectedDirection] = useState("");
  const [selectedDirectionDescription, setSelectedDirectionDescription] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [currentGroupName, setCurrentGroupName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    group: "",
    specialty: "",
    studentId: "",
  });
  const [groups, setGroups] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [students, setStudents] = useState([]);
  const [filteredStudentsCount, setFilteredStudentsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "lastName",
    direction: "asc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [eventsCount, setEventsCount] = useState(0);
  const [studentEvents, setStudentEvents] = useState([]);
  const studentsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);

        const [directionsRes, groupsRes, studentsRes, eventsRes] = await Promise.all([
          fetch("http://localhost:5000/api/directions"),
          fetch("http://localhost:5000/api/groups"),
          fetch("http://localhost:5000/api/students"),
          fetch("http://localhost:5000/api/events")
        ]);

        if (!directionsRes.ok || !groupsRes.ok || !studentsRes.ok || !eventsRes.ok) {
          throw new Error("Ошибка при загрузке данных");
        }

        const [directionsData, groupsData, studentsData, eventsData] = await Promise.all([
          directionsRes.json(),
          groupsRes.json(),
          studentsRes.json(),
          eventsRes.json()
        ]);

        setDirections(directionsData);
        setSpecialties(directionsData);
        setGroups(sortGroupsAlphabetically(groupsData));
        setStudents(studentsData);
        setEventsCount(eventsData.length);

        const isipDirection = directionsData.find(d => d.name === "ИСиП");
        if (isipDirection) {
          setSelectedDirection(isipDirection._id);
          setSelectedDirectionDescription(isipDirection.description);

          const directionGroups = sortGroupsAlphabetically(
            groupsData.filter(g => isipDirection.groups.includes(g._id))
          );

          if (directionGroups.length > 0) {
            setSelectedGroup(directionGroups[0]._id);
            setCurrentGroupName(directionGroups[0].name);
          }
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  const loadStudentEvents = async (studentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/students/${studentId}/events`);
      if (!response.ok) throw new Error("Ошибка при загрузке мероприятий студента");
      const events = await response.json();
      setStudentEvents(events);
    } catch (err) {
      console.error("Ошибка:", err);
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    loadStudentEvents(student._id);
    setIsModalOpen(true);
  };

  const sortGroupsAlphabetically = (groupsArray) => {
    return [...groupsArray].sort((a, b) => a.name.localeCompare(b.name));
  };

  const getFilteredGroups = () => {
    if (!selectedDirection) return sortGroupsAlphabetically(groups);

    const selectedDirectionObj = directions.find(d => d._id === selectedDirection);
    if (!selectedDirectionObj) return sortGroupsAlphabetically(groups);

    return sortGroupsAlphabetically(
      groups.filter(g => selectedDirectionObj.groups.includes(g._id))
    );
  };

  useEffect(() => {
    const group = groups.find(g => g._id === selectedGroup);
    setCurrentGroupName(group?.name || "");
  }, [selectedGroup, groups]);

  const getLastName = (student) => {
    return student.lastName || student.fullName?.split(" ")[0] || "";
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredStudents = students
    .filter(student => {
      const directionMatch = !selectedDirection || student.specialty?._id === selectedDirection;
      const groupMatch = !selectedGroup || student.group?._id === selectedGroup;
      const searchMatch = !searchQuery ||
        getLastName(student).toLowerCase().includes(searchQuery.toLowerCase());
      return directionMatch && groupMatch && searchMatch;
    })
    .sort((a, b) => {
      const lastNameA = getLastName(a).toLowerCase();
      const lastNameB = getLastName(b).toLowerCase();

      if (sortConfig.direction === "asc") {
        return lastNameA.localeCompare(lastNameB);
      } else {
        return lastNameB.localeCompare(lastNameA);
      }
    });

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  useEffect(() => {
    setFilteredStudentsCount(filteredStudents.length);
    setCurrentPage(1);
  }, [filteredStudents.length, selectedDirection, selectedGroup, searchQuery]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0 });
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleDirectionChange = (e) => {
    const selectedId = e.target.value;
    setSelectedDirection(selectedId);

    const direction = directions.find(d => d._id === selectedId);
    if (direction) {
      setSelectedDirectionDescription(direction.description);

      const directionGroups = getFilteredGroups().filter(g =>
        direction.groups.includes(g._id)
      );

      if (directionGroups.length > 0) {
        setSelectedGroup(directionGroups[0]._id);
      } else {
        setSelectedGroup("");
      }
    }
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  const handleNewStudentChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === "specialty") {
      setSelectedSpecialty(value);
    }
  };

  const handleSaveNewStudent = async () => {
    try {
      console.log("Отправляемые данные:", newStudent); // Логирование данных
      const response = await fetch("http://localhost:5000/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStudent),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка при добавлении студента");
      }

      const addedStudent = await response.json();
      setStudents(prev => [...prev, addedStudent]);
      setIsAddModalOpen(false);
      setNewStudent({
        lastName: "",
        firstName: "",
        middleName: "",
        group: "",
        specialty: "",
        studentId: "",
      });
    } catch (err) {
      console.error("Ошибка при добавлении студента:", err);
      alert(err.message);
    }
  };


  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedStudent = async (updatedData) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/students/${selectedStudent._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка при обновлении студента");
      }

      const updatedStudent = await response.json();
      setStudents(prev =>
        prev.map(s => (s._id === updatedStudent._id ? updatedStudent : s))
      );
      setIsEditModalOpen(false);
      setSelectedStudent(null);
    } catch (err) {
      console.error("Ошибка при обновлении студента:", err);
      throw err;
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Вы уверены, что хотите удалить этого студента?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/students/${studentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при удалении студента");
      }

      setStudents(prev => prev.filter(s => s._id !== studentId));
    } catch (err) {
      console.error("Ошибка при удалении студента:", err);
      alert("Не удалось удалить студента");
    }
  };

  const exportStudent = async (student) => {
    try {
      // Загружаем все мероприятия
      const response = await fetch('http://localhost:5000/api/events');
      if (!response.ok) throw new Error("Ошибка при загрузке мероприятий");
      const allEvents = await response.json();

      // Фильтруем мероприятия для текущего студента
      const studentEvents = allEvents.filter(event =>
        event.students.some(s => s._id === student._id)
      );

      // Форматируем данные мероприятий
      const formattedEvents = studentEvents.map(event => ({
        title: event.title,
        date: event.date,
        time: event.time,
        place: event.place,
        organizer: event.organizer,
        city: event.city,
        responsiblePerson: event.responsiblePerson
      }));

      // Вызываем экспорт с количеством мероприятий
      await ExcelExporter.exportStudentDetails(student, formattedEvents);

    } catch (err) {
      console.error("Ошибка при экспорте студента:", err);
      alert("Не удалось экспортировать данные студента");
    }
  };
  // Функция для экспорта в Excel
  const exportToExcel = async () => {
    try {
      await ExcelExporter.exportStudents(
        filteredStudents,
        directions,
        selectedDirection,
        currentGroupName
      );
    } catch (err) {
      console.error('Ошибка при экспорте в Excel:', err);
      alert('Не удалось выполнить экспорт');
    }
  };

  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }

  return (
    <>
      <Helmet>
        <title>Студенты</title>
      </Helmet>
      <div className="student-page">
        <Header />
        <div className="student-page-content">
          <div className="student-page-header">
            <div className="header-item">
              <div className="icon-container">
                <img src={studentPage} alt="" />
              </div>
              <div className="header-title-container">
                <div className="header-subtitle">Кол-во студентов:</div>
                <div className="header-title">{filteredStudentsCount}</div>
              </div>
            </div>
            <div className="vertical-line"></div>

            <div className="header-item">
              <div className="icon-container">
                <img src={save} alt="" />
              </div>
              <div className="header-title-container">
                <div className="header-subtitle">Кол-во мероприятий:</div>
                <div className="header-title">{eventsCount}</div>
              </div>
            </div>
          </div>
          <div className="student-page-body">
            <div className="student-page-body-header">
              <div className="student-list-page">
                <div className="calendar-search-container">
                  <div className="input-icon-container">
                    <img src={search} alt="search" />
                  </div>
                  <input
                    type="text"
                    className="calendar-search-input"
                    placeholder="Поиск"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                <select
                  className="select"
                  value={selectedDirection}
                  onChange={handleDirectionChange}
                >
                  {directions.map((direction) => (
                    <option key={direction._id} value={direction._id}>
                      {direction.name}
                    </option>
                  ))}
                </select>
                <select
                  className="select"
                  value={selectedGroup}
                  onChange={handleGroupChange}
                  disabled={!selectedDirection}
                >
                  <option value="">Все группы</option>
                  {getFilteredGroups().map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="block-student-actions">
                <button
                  className="add-btn-st"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <FaUserPlus className="add-icon" /> Добавить
                </button>
                <button
                  className="export-btn"
                  onClick={exportToExcel}
                  disabled={filteredStudents.length === 0}
                  title="Экспорт в Excel"
                >
                  <FaFileExcel className="excel-icon" /> Экспорт
                </button>
              </div>

            </div>
            <div className="student-page-body-header-title-container">
              <div className="student-page-body-header-title">
                <h1>Специальность:</h1> <h3>{selectedDirectionDescription || "Информационные системы и программирование"}</h3>
              </div>
              <div className="student-page-body-header-group">
                <h4>Группа: {currentGroupName || "Не выбрана"}</h4>
              </div>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th
                      onClick={() => requestSort("lastName")}
                      className="sortable-header"
                    >
                      ФИО
                      {sortConfig.key === "lastName" && (
                        <span className="sort-icon">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </th>
                    <th>Группа</th>
                    <th>Специальность</th>
                    <th>Номер студ. билета</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody id="table-body">
                  {currentStudents.length > 0 ? (
                    currentStudents.map((student) => (
                      <tr
                        key={student._id}
                        className="student-row"
                        onClick={() => handleStudentClick(student)}
                      >
                        <td className="student-cell">
                          {student.lastName} {student.firstName} {student.middleName}
                        </td>
                        <td className="student-cell center">{student.group?.name}</td>
                        <td className="student-cell center">{student.specialty?.name}</td>
                        <td className="student-cell center">{student.studentId}</td>
                        <td className="actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="icon-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStudent(student);
                            }}
                            title="Редактировать"
                          >
                            <img src={edit} alt="Редактировать" className="action-icon" />
                          </button>
                          <button
                            className="icon-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              exportStudent(student);
                            }}
                            title="Экспорт в Excel"
                          >
                            <GrDocumentExcel color="#044382" alt="Экспорт" className="action-icon" />
                          </button>
                          <button
                            className="icon-btn"
                            onClick={() => handleDeleteStudent(student._id)}
                            title="Удалить"
                          >
                            <img src={delete_} alt="Удалить" className="action-icon" />
                          </button>

                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">
                        Нет данных для отображения
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredStudents.length > studentsPerPage && (
              <div className="pagination-container">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredStudents.length / studentsPerPage)}
                  paginate={paginate}
                />
              </div>
            )}

            <StudentInfoModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onEdit={() => setIsEditModalOpen(true)}
              student={selectedStudent}
              events={studentEvents}
            />

            <EditStudentModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedStudent(null);
              }}
              student={selectedStudent}
              onSave={handleSaveEditedStudent}
              groups={groups}
              directions={directions}
            />

            <AddStudentModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              newStudent={newStudent}
              onChange={handleNewStudentChange}
              onSave={handleSaveNewStudent}
              groups={groups}
              specialties={specialties}
              selectedSpecialty={selectedSpecialty}
              directions={directions}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Students;