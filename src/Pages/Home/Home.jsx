import React, { useContext, useState, useEffect, useCallback } from "react";
import "./index.css";
import { Helmet } from "react-helmet";
import Header from "../../Components/Header/Header";
import user from "../../img/user.svg";
import search from "../../img/search-icon.svg";
import reshot from "../../img/reshot-icon-student.svg";
import clock from "../../img/clock.svg";
import concert from "../../img/online_concert_interaction.svg";
import events from "../../img/calendar_event_star.svg";
import china from "../../img/china_flag_icon.svg";
import bell from "../../img/bell-icon.svg";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { EventsContext } from "../../Components/EventsContext";
import ViewModal from "../../Components/Calendar/ViewModal";
import { toast } from "react-toastify";

const NOTIFICATIONS_KEY = 'app_notifications';

const Home = () => {
  const { eventsData } = useContext(EventsContext);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
  const [pastEventsCount, setPastEventsCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [dailyQuote, setDailyQuote] = useState({ text: "Загрузка цитаты...", author: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const eventImages = {
    "reshot-icon-student.svg": reshot,
    "online_concert_interaction.svg": concert,
    "calendar_event_star.svg": events,
    "china_flag_icon.svg": china,
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    const savedNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY)) || [];
    setNotifications(savedNotifications);

    const fetchDailyQuote = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/quotes/daily-quote");
        if (!response.ok) throw new Error("Ошибка при загрузке цитаты");
        const data = await response.json();
        setDailyQuote({ text: data.text, author: data.author });
      } catch (error) {
        console.error("Ошибка:", error);
        setDailyQuote({ text: "Не удалось загрузить цитату", author: "" });
      }
    };

    fetchDailyQuote();
  }, []);

  // Сохранение уведомлений при изменении
  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Проверка предстоящих мероприятий
  useEffect(() => {
    const checkUpcomingEvents = () => {
      const now = new Date();
      const newNotifications = [];

      eventsData.forEach((event) => {
        try {
          const [year, month, day] = event.date.split('-');
          const [hours, minutes] = event.time.split(':');
          const eventDateTime = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hours),
            parseInt(minutes)
          );

          const timeDiff = (eventDateTime - now) / (1000 * 60);

          if (timeDiff > 0 && timeDiff <= 5) {
            const notificationKey = `notified_${event._id}`;
            const notificationExists = notifications.some(n => n.eventId === event._id);

            if (!localStorage.getItem(notificationKey) && !notificationExists) {
              const notification = {
                id: `${event._id}_${now.getTime()}`,
                text: `Скоро начнется: "${event.title}" в ${event.time}`,
                eventId: event._id,
                date: new Date().toISOString(),
                isRead: false
              };

              newNotifications.push(notification);
              localStorage.setItem(notificationKey, 'true');

              toast.info(notification.text, {
                position: "bottom-right",
                autoClose: 5000,
              });

              setTimeout(() => {
                localStorage.removeItem(notificationKey);
                setNotifications(prev => prev.filter(n => n.eventId !== event._id));
              }, 60 * 60 * 1000);
            }
          }
        } catch (error) {
          console.error('Ошибка при проверке события:', error);
        }
      });

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
      }
    };

    const interval = setInterval(checkUpcomingEvents, 60000);
    checkUpcomingEvents();
    return () => clearInterval(interval);
  }, [eventsData, notifications]);

  // Подсчет событий
  const countEvents = useCallback(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const eventsThisMonth = eventsData.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getMonth() === currentMonth &&
        eventDate.getFullYear() === currentYear
      );
    });

    const upcomingEvents = eventsThisMonth.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === now.toDateString() || eventDate > now;
    });

    const pastEvents = eventsThisMonth.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate < now;
    });

    setUpcomingEventsCount(upcomingEvents.length);
    setPastEventsCount(pastEvents.length);
  }, [eventsData]);

  useEffect(() => {
    countEvents();
  }, [countEvents]);

  // Обработчики событий
  const handleViewClick = (event) => {
    setSelectedEvent(event);
    setViewModalOpen(true);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  // Компонент выпадающего списка уведомлений
  const NotificationsDropdown = () => {
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = (id) => {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    };

    return (
      <div className={`notifications-dropdown ${showNotifications ? 'active' : ''}`}>
        <div className="notifications-header">
          <h3>Уведомления {unreadCount > 0 && `(${unreadCount})`}</h3>
          <button
            className="clear-btn"
            onClick={() => {
              setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }}
          >
            Прочитать все
          </button>
          <span className="close-btn" onClick={() => setShowNotifications(false)}>×</span>
        </div>
        <div className="notifications-list">
          {notifications.length > 0 ? (
            [...notifications]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                  onClick={() => {
                    const event = eventsData.find(e => e._id === notification.eventId);
                    if (event) {
                      setSelectedEvent(event);
                      setViewModalOpen(true);
                      markAsRead(notification.id);
                      setShowNotifications(false);
                    }
                  }}
                >
                  <p>{notification.text}</p>
                  <small>{new Date(notification.date).toLocaleString()}</small>
                </div>
              ))
          ) : (
            <p className="no-notifications">Нет новых уведомлений</p>
          )}
        </div>
      </div>
    );
  };

  const eventsThisMonth = eventsData.filter((event) => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getMonth() === new Date().getMonth() &&
      eventDate.getFullYear() === new Date().getFullYear() &&
      (eventDate.toDateString() === new Date().toDateString() || eventDate > new Date())
    );
  });

  const filteredEvents = eventsThisMonth
    .filter((event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5);

  const chartData = [
    { name: "ИСиП", "Статистика активности": 8 },
    { name: "Нач. кл.", "Статистика активности": 6 },
    { name: "Дошкол.", "Статистика активности": 4 },
    { name: "Физ. кул.", "Статистика активности": 2 },
  ];

  const filteredChartData = selectedDepartment === "all"
    ? chartData
    : chartData.filter((item) => item.name === selectedDepartment);

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <Helmet>
        <title>Главная страница</title>
      </Helmet>
      <div className="home-page">
        <Header />
        <div className="home-page-content">
          <div className="home-page-content-left-side">
            <div className="user-profile">
              <div className="user-profile-left-side">
                <h1 className="greeting-container">
                  Привет, {currentUser ? currentUser.username : "гость"}!
                </h1>
                <div className="quote-container">
                  <p className="quote-text">{dailyQuote.text}</p>
                  <p className="quote-author">{dailyQuote.author}</p>
                </div>
              </div>
              <div className="user-profile-right-side">
                <img src={user} alt="user" />
              </div>
            </div>

            <div className="events-container">
              <div className="events-container-title">Мероприятия этого месяца</div>
              <div className="events-items-container">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <div className="events-item" key={event._id}>
                      <div className="events-item-image-container">
                        <img src={eventImages[event.image]} alt="" />
                      </div>
                      <div className="events-item-title">{event.title}</div>
                      <div className="events-item-date-container">
                        <div><img src={clock} alt="" /></div>
                        <div>{event.date}</div>
                      </div>
                      <div
                        className="events-item-button"
                        onClick={() => handleViewClick(event)}
                      >
                        Подробнее
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-events-message">
                    В текущем месяце нет запланированных мероприятий
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="home-page-content-right-side">
            <div className="home-page-content-right-side-header">
              <div className="search-container">
                <img src={search} alt="search" />
                <input
                  type="text"
                  className="search-input"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Поиск мероприятий..."
                />
              </div>
              <div className="home-page-content-right-side-header-item notification-icon-container">
                {unreadNotificationsCount > 0 && (
                  <div className="notification-badge">
                    {unreadNotificationsCount}
                  </div>
                )}
                <img
                  src={bell}
                  alt="bell"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                  }}
                  className="notification-icon"
                />
                <NotificationsDropdown />
              </div>
              {/* <div className="home-page-content-right-side-header-item">
                  <img src={user_icon} alt="" />
                <img src={chevron} alt="" />
              </div> */}
            </div>

            <div className="home-page-cards-container">
              <div className="home-page-card">
                <div className="home-page-card-number">{upcomingEventsCount}</div>
                <div className="home-page-card-title">
                  мероприятия будет в этом месяце
                </div>
              </div>
              <div className="home-page-card">
                <div className="home-page-card-number">{pastEventsCount}</div>
                <div className="home-page-card-title">
                  мероприятия прошло в этом месяце
                </div>
              </div>
            </div>

            <div className="home-page-statistic-container">
              <div className="title">Статистика активности отделений</div>
              <select value={selectedDepartment} onChange={handleDepartmentChange}>
                <option value="all">Все отделения</option>
                <option value="ИСиП">ИСиП</option>
                <option value="Нач. кл.">Нач. кл.</option>
                <option value="Дошкол.">Дошкол.</option>
                <option value="Физ. кул.">Физ. кул.</option>
              </select>
              <div className="chart-container">
                <BarChart
                  width={500}
                  height={400}
                  data={filteredChartData}
                  margin={{ top: 10, right: -20, left: -20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="15 0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Статистика активности" fill="#1E3A8A" barSize={60} />
                </BarChart>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        selectedEvent={selectedEvent}
        eventImages={eventImages}
      />
    </>
  );
};

export default Home;