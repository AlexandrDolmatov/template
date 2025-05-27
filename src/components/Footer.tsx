import React from 'react';

/**
 * Нижний футер приложения.
 */
const Footer: React.FC = () => (
  <footer>
    <div className="footer-section">
      <h4>Last.fm Clone</h4>
      <ul>
        <li>2025 &copy; Alexandr Dolmatov</li>
        <li>Неофициальный дипломный проект</li>
      </ul>
    </div>
    <div className="footer-section">
      <h4>Навигация</h4>
      <ul>
        <li><a href="/">Главная</a></li>
        <li><a href="https://www.last.fm/" target="_blank" rel="noopener noreferrer">Оригинал Last.fm</a></li>
      </ul>
    </div>
    <div className="footer-section">
      <h4>Связь</h4>
      <ul>
        <li><a href="mailto:dolmatov_ae@icloud.com">Почта</a></li>
        <li><a href="https://github.com/AlexandrDolmatov" target="_blank" rel="noopener noreferrer">GitHub</a></li>
      </ul>
    </div>
  </footer>
);

export default Footer;
