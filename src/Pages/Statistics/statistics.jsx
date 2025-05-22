import React, { useState, useEffect } from "react";
import "./statistic.css";
import { Helmet } from "react-helmet";
import Header from "../../Components/Header/Header";
import Pagination from "../../Components/Pagination";
import ExcelExporter from "../../utils/ExcelExporter";
import { FaFileExcel } from 'react-icons/fa';

const Statistics = () => {
    const [events, setEvents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [directions, setDirections] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [specialtyFilter, setSpecialtyFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const eventsPerPage = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventsRes, departmentsRes, directionsRes] = await Promise.all([
                    fetch("http://localhost:5000/api/events"),
                    fetch("http://localhost:5000/api/departments"),
                    fetch("http://localhost:5000/api/directions")
                ]);

                if (!eventsRes.ok || !departmentsRes.ok || !directionsRes.ok) {
                    throw new Error("Ошибка при загрузке данных");
                }

                const [eventsData, departmentsData, directionsData] = await Promise.all([
                    eventsRes.json(),
                    departmentsRes.json(),
                    directionsRes.json()
                ]);

                setEvents(eventsData);
                setDepartments(departmentsData);
                setDirections(directionsData);
            } catch (err) {
                console.error("Ошибка при загрузке данных:", err);
            }
        };

        fetchData();
    }, []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleDateFilterChange = (e) => {
        setDateFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleSpecialtyFilterChange = (e) => {
        setSpecialtyFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleDepartmentFilterChange = (e) => {
        setDepartmentFilter(e.target.value);
        setCurrentPage(1);
    };

    const filteredEvents = events.filter(event => {
        const searchMatch = !searchQuery ||
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.students.some(student => student.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            event.teachers.some(teacher => teacher.fullName.toLowerCase().includes(searchQuery.toLowerCase()));

        const dateMatch = !dateFilter ||
            new Date(event.date).toLocaleDateString() === new Date(dateFilter).toLocaleDateString();

        const specialtyMatch = !specialtyFilter ||
            event.students.some(student => student.specialty === specialtyFilter) ||
            event.teachers.some(teacher => teacher.specialty === specialtyFilter);

        const departmentMatch = !departmentFilter ||
            event.students.some(student => student.department === departmentFilter) ||
            event.teachers.some(teacher => teacher.department === departmentFilter);

        return searchMatch && dateMatch && specialtyMatch && departmentMatch;
    });

    const sortedEvents = [...filteredEvents].sort((a, b) => {
        if (dateFilter) {
            return new Date(a.date) - new Date(b.date);
        } else if (specialtyFilter) {
            return a.students.some(student => student.specialty === specialtyFilter) ||
                a.teachers.some(teacher => teacher.specialty === specialtyFilter)
                ? -1 : 1;
        } else if (departmentFilter) {
            return a.students.some(student => student.department === departmentFilter) ||
                a.teachers.some(teacher => teacher.department === departmentFilter)
                ? -1 : 1;
        }
        return 0;
    });

    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0 });
    };

    const exportToExcel = async () => {
        try {
            await ExcelExporter.exportEvents(
                filteredEvents,
                departments,
                directions,
                dateFilter,
                specialtyFilter,
                departmentFilter
            );
        } catch (err) {
            console.error('Ошибка при экспорте в Excel:', err);
            alert('Не удалось выполнить экспорт');
        }
    };

    return (
        <>
            <Helmet>
                <title>Статистика</title>
            </Helmet>
            <div className="statistic-page">
                <Header />
                <div className="statistic-page-content">
                    <div className="statistic-page-body">
                        <div className="statistic-page-body-header">
                            <div className="calendar-search-container">
                                <input
                                    type="text"
                                    className="calendar-search-input"
                                    placeholder="Поиск"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <div className="filter-container">
                                <div className="filter-item">
                                    <label>Фильтр по дате:</label>
                                    <input
                                        type="date"
                                        className="filter-input"
                                        value={dateFilter}
                                        onChange={handleDateFilterChange}
                                    />
                                </div>
                                <div className="filter-item">
                                    <label>Фильтр по специальности:</label>
                                    <select
                                        className="filter-select"
                                        value={specialtyFilter}
                                        onChange={handleSpecialtyFilterChange}
                                    >
                                        <option value="">Все специальности</option>
                                        {directions.map(direction => (
                                            <option key={direction._id} value={direction._id}>
                                                {direction.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="filter-item">
                                    <label>Фильтр по ПЦК:</label>
                                    <select
                                        className="filter-select"
                                        value={departmentFilter}
                                        onChange={handleDepartmentFilterChange}
                                    >
                                        <option value="">Все ПЦК</option>
                                        {departments.map(department => (
                                            <option key={department._id} value={department._id}>
                                                {department.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>
                            <button
                                className="export-btn"
                                onClick={exportToExcel}
                                disabled={filteredEvents.length === 0}
                                title="Экспорт в Excel"
                            >
                                <FaFileExcel className="excel-icon" /> Экспорт
                            </button>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Название мероприятия</th>
                                        <th>Дата</th>
                                        <th>Участники</th>
                                    </tr>
                                </thead>
                                <tbody id="table-body">
                                    {currentEvents.length > 0 ? (
                                        currentEvents.map((event) => (
                                            <tr key={event._id} className="event-row">
                                                <td className="event-cell">{event.title}</td>
                                                <td className="date-cell">{new Date(event.date).toLocaleDateString()}</td>
                                                <td className="participants-cell">
                                                    {event.students && event.students.length > 0 ? (
                                                        <div className="participants-list">
                                                            {event.students.map(student => (
                                                                <div key={student._id}>{student.fullName}</div>
                                                            ))}
                                                        </div>
                                                    ) : "Нет участников"}
                                                    {event.teachers && event.teachers.length > 0 ? (
                                                        <div className="participants-list">
                                                            {event.teachers.map(teacher => (
                                                                <div key={teacher._id}>{teacher.fullName}</div>
                                                            ))}
                                                        </div>
                                                    ) : ""}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="no-data">
                                                Нет данных для отображения
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {sortedEvents.length > eventsPerPage && (
                            <div className="pagination-container">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={Math.ceil(sortedEvents.length / eventsPerPage)}
                                    paginate={paginate}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Statistics;
