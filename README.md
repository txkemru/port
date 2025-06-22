# 🚀 Port - Социальная платформа для портфолио

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.10.1-2D3748?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

**Современная социальная платформа для создания и демонстрации портфолио с возможностью взаимодействия между пользователями**


</div>

---

## ✨ Особенности

- 🎨 **Современный UI/UX** - Красивый интерфейс с использованием Tailwind CSS
- 👥 **Социальные функции** - Лайки, комментарии, подписки, сохранение постов
- 📱 **Адаптивный дизайн** - Отлично работает на всех устройствах
- 🔐 **Безопасная аутентификация** - Защищенная система регистрации и входа
- 🖼️ **Загрузка медиа** - Поддержка изображений и GIF-анимаций
- 🔍 **Поиск пользователей** - Поиск по имени пользователя
- 📊 **Профили пользователей** - Детальные профили с настройками
- ⚡ **Быстрая производительность** - Оптимизировано с Next.js 15 и Turbopack

## 🛠️ Технологический стек

### Frontend
- **Next.js 15** - React фреймворк с App Router
- **React 19** - Библиотека для создания пользовательских интерфейсов
- **TypeScript** - Типизированный JavaScript
- **Tailwind CSS 4** - Utility-first CSS фреймворк
- **React Icons** - Библиотека иконок

### Backend & Database
- **Prisma** - ORM для работы с базой данных
- **SQLite** - Легковесная база данных
- **bcryptjs** - Хеширование паролей
- **multer** - Обработка загрузки файлов

### Дополнительные библиотеки
- **@dnd-kit** - Drag & Drop функциональность
- **uuid** - Генерация уникальных идентификаторов

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ 
- npm или yarn
- Git

### Установка

1. **Клонируйте репозиторий**
```bash
git clone https://github.com/txkemru/port.git
cd port
```

2. **Установите зависимости**
```bash
npm install
```

3. **Настройте базу данных**
```bash
npx prisma generate
npx prisma db push
```

4. **Создайте файл .env**
```bash
cp .env.example .env
```

5. **Запустите сервер разработки**
```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 📁 Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API маршруты
│   ├── home/              # Главная страница
│   ├── login/             # Страница входа
│   ├── register/          # Страница регистрации
│   ├── profile/           # Профили пользователей
│   └── portfolio/         # Портфолио
├── components/            # React компоненты
├── context/              # React Context
├── lib/                  # Утилиты и конфигурация
└── pages/                # Страницы приложения

prisma/
├── schema.prisma         # Схема базы данных
└── migrations/           # Миграции БД
```

## 🗄️ Модели данных

### Основные сущности:
- **User** - Пользователи системы
- **Profile** - Профили пользователей
- **Post** - Посты/публикации
- **File** - Загруженные файлы
- **Like** - Лайки постов
- **Comment** - Комментарии
- **Follow** - Подписки между пользователями
- **Save** - Сохраненные посты

## 🔧 API Endpoints

### Аутентификация
- `POST /api/login` - Вход в систему
- `POST /api/user-create` - Регистрация пользователя

### Пользователи
- `GET /api/user` - Получить текущего пользователя
- `GET /api/profile` - Получить профиль
- `GET /api/user-profile/:username` - Профиль по username
- `POST /api/check-username` - Проверить доступность username

### Контент
- `GET /api/feed` - Лента постов
- `POST /api/post` - Создать пост
- `GET /api/publications` - Публикации пользователя
- `GET /api/search` - Поиск пользователей

### Взаимодействие
- `POST /api/like` - Лайк/анлайк поста
- `POST /api/comment` - Добавить комментарий
- `POST /api/follow` - Подписаться/отписаться
- `POST /api/save` - Сохранить/удалить из сохраненных



## 🤝 Вклад в проект

Мы приветствуем вклад в развитие проекта! 

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request


## 👨‍💻 Разработчик

**Владимир Пушков** - [GitHub](https://github.com/txkemru) • [Telegram](https://t.me/txkem)

---

<div align="center">

⭐ **Если проект вам понравился, поставьте звездочку!** ⭐

</div>
