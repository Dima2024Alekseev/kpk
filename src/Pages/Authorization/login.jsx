import React, { useState, useEffect } from "react";
import "./login.css";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import logo_auth from "../../img/logo-auth.svg";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Проверяем, авторизован ли пользователь при монтировании компонента
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация полей
    if (!username.trim() || !password.trim()) {
      toast.error("Заполните все поля");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при авторизации");
      }

      // Сохраняем данные
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Авторизация успешна!");

      // Перенаправляем с задержкой для отображения toast
      setTimeout(() => navigate("/home"), 1000);

    } catch (error) {
      console.error("Ошибка авторизации:", error);
      toast.error(error.message || "Ошибка при авторизации");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Авторизация</title>
      </Helmet>
      <main className="auth-main-container">
        <div className="left-side-auth">
          <div className="left-side-auth-logo-container">
            <img src={logo_auth} alt="Логотип" />
          </div>
        </div>
        <div className="right-side-auth">
          <div className="right-side-auth-title">Авторизация</div>
          <form className="auth-form-container" onSubmit={handleSubmit}>
            <div className="auth-form-item">
              <label className="right-side-auth-title-input">Логин</label>
              <input
                type="text"
                className="right-side-auth-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
              />
            </div>
            <div className="auth-form-item">
              <label className="right-side-auth-title-input">Пароль</label>
              <input
                type="password"
                className="right-side-auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              // minLength={6}
              />
            </div>
            <button
              className="right-side-auth-button"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Загрузка..." : "Авторизоваться"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
};

export default Login;