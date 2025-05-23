import React from 'react';
import './styleModalStatistics.css';
import { FiSearch, FiX, FiDownload } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, onExport, events }) => {
    const [selectedEvent, setSelectedEvent] = React.useState('all');
    const [searchTerm, setSearchTerm] = React.useState('');

    if (!isOpen) return null;

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Экспорт мероприятий</h2>
                </div>

                <div className="modal-search">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Поиск мероприятий..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="modal-search-input"
                    />
                    {searchTerm && (
                        <button
                            className="clear-search"
                            onClick={() => setSearchTerm('')}
                        >
                            <FiX size={16} />
                        </button>
                    )}
                </div>

                <div className="modal-body">
                    <div className="radio-group">
                        <label className={`radio-option ${selectedEvent === 'all' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                value="all"
                                checked={selectedEvent === 'all'}
                                onChange={() => setSelectedEvent('all')}
                            />
                            <span className="radio-custom"></span>
                            Все мероприятия
                        </label>
                    </div>

                    <div className="events-list">
                        {filteredEvents.map(event => (
                            <label
                                key={event._id}
                                className={`radio-option ${selectedEvent === event._id ? 'selected' : ''}`}
                            >
                                <input
                                    type="radio"
                                    value={event._id}
                                    checked={selectedEvent === event._id}
                                    onChange={() => setSelectedEvent(event._id)}
                                />
                                <span className="radio-custom"></span>
                                <span className="event-title">{event.title}</span>
                            </label>
                        ))}
                    </div>

                    {filteredEvents.length === 0 && (
                        <div className="no-events-found">
                            <p>Мероприятия не найдены</p>
                            {searchTerm && (
                                <button
                                    className="reset-search"
                                    onClick={() => setSearchTerm('')}
                                >
                                    Сбросить поиск
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        Отмена
                    </button>
                    <button
                        className="export-btn"
                        onClick={() => onExport(selectedEvent)}
                        disabled={filteredEvents.length === 0 && selectedEvent !== 'all'}
                    >
                        <FiDownload className="export-icon" />
                        Экспорт
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;