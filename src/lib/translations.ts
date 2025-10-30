export type Language = 'ru' | 'en';

export const translations = {
  ru: {
    app: {
      name: 'GDeStore',
      tagline: 'Игровая платформа для Android'
    },
    auth: {
      login: 'Вход',
      register: 'Регистрация',
      email: 'Email',
      password: 'Пароль',
      username: 'Имя пользователя',
      loginButton: 'Войти',
      registerButton: 'Зарегистрироваться',
      logout: 'Выйти',
      loginSuccess: 'Вход выполнен успешно!',
      registerSuccess: 'Регистрация успешна!',
      loginError: 'Ошибка входа',
      registerError: 'Ошибка регистрации',
      connectionError: 'Ошибка подключения',
      youAreBanned: 'Вы заблокированы'
    },
    nav: {
      shop: 'Магазин',
      library: 'Библиотека',
      frames: 'Рамки',
      admin: 'Админ',
      settings: 'Настройки'
    },
    shop: {
      title: 'Каталог игр',
      publishGame: 'Опубликовать игру',
      noGames: 'Игры скоро появятся',
      buy: 'Купить',
      purchased: 'Куплено',
      notEnoughMoney: 'Недостаточно средств на балансе',
      purchaseSuccess: 'Игра успешно куплена!'
    },
    publish: {
      title: 'Публикация игры',
      description: 'Заполните форму для отправки игры на модерацию',
      selectEngine: 'Выберите движок игры',
      gdevelopFree: 'Игра на GDevelop (бесплатно)',
      otherEnginePaid: 'Игра на другом движке (50 ₽)',
      gameName: 'Название игры',
      gameDescription: 'Описание',
      genre: 'Жанр',
      genrePlaceholder: 'Экшен, RPG, и т.д.',
      ageRating: 'Возрастное ограничение',
      price: 'Цена (₽)',
      logoUrl: 'URL логотипа',
      fileUrl: 'URL файла игры (.zip или .rar для ПК)',
      contactEmail: 'Email для связи',
      publishButton: 'Опубликовать',
      publishSuccess: 'Игра отправлена на модерацию! Мы свяжемся с вами по email.',
      publishError: 'Ошибка отправки',
      paymentRequired: 'Для публикации игры на другом движке требуется 50 ₽',
      paymentSuccess: 'Оплата прошла успешно! Списано 50 ₽',
      pcGamesOnly: 'Публикация только ПК игр (.zip или .rar файлы)'
    },
    library: {
      title: 'Моя библиотека',
      noGames: 'У вас пока нет игр',
      download: 'Скачать',
      delete: 'Удалить (возврат 90%)',
      deleteSuccess: 'Игра удалена! Возврат:'
    },
    frames: {
      title: 'Магазин рамок',
      shop: 'Магазин',
      myFrames: 'Мои рамки',
      purchased: 'Куплено',
      buy: 'Купить',
      install: 'Установить',
      remove: 'Снять',
      purchaseSuccess: 'Рамка куплена!',
      installSuccess: 'Рамка установлена!',
      removeSuccess: 'Рамка снята',
      notEnoughMoney: 'Недостаточно средств'
    },
    profile: {
      title: 'Профиль',
      username: 'Имя пользователя',
      avatarUrl: 'URL аватара',
      timeSpent: 'Время на сайте',
      hours: 'часов',
      updateSuccess: 'Профиль обновлён!'
    },
    admin: {
      title: 'Админ-панель',
      users: 'Пользователи',
      moderation: 'Модерация игр',
      createFrame: 'Создать рамку',
      downloadSite: 'Скачать сайт',
      searchPlaceholder: 'Поиск по имени пользователя...',
      balance: 'Баланс',
      verify: 'Верифицировать',
      removeVerification: 'Снять ✓',
      ban: 'Забанить',
      unban: 'Разбанить',
      balanceUpdated: 'Баланс обновлён',
      userBanned: 'Пользователь заблокирован',
      userUnbanned: 'Пользователь разблокирован',
      userVerified: 'Пользователь верифицирован',
      verificationRemoved: 'Верификация снята',
      noPendingGames: 'Нет игр на модерации',
      gameEngine: 'Движок',
      gdevelop: 'GDevelop',
      otherEngine: 'Другой движок',
      contactEmail: 'Email',
      downloadApk: 'Скачать файл',
      approve: 'Одобрить',
      reject: 'Отклонить',
      gameApproved: 'Игра одобрена',
      gameRejected: 'Игра отклонена',
      frameCreated: 'Рамка создана!',
      frameName: 'Название рамки',
      frameImageUrl: 'URL изображения',
      framePrice: 'Цена (₽)',
      createFrameButton: 'Создать рамку'
    },
    settings: {
      title: 'Настройки',
      language: 'Язык',
      russian: 'Русский',
      english: 'English'
    },
    common: {
      error: 'Ошибка',
      success: 'Успешно',
      cancel: 'Отмена',
      save: 'Сохранить'
    }
  },
  en: {
    app: {
      name: 'GDeStore',
      tagline: 'Android Gaming Platform'
    },
    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      username: 'Username',
      loginButton: 'Log In',
      registerButton: 'Sign Up',
      logout: 'Logout',
      loginSuccess: 'Login successful!',
      registerSuccess: 'Registration successful!',
      loginError: 'Login error',
      registerError: 'Registration error',
      connectionError: 'Connection error',
      youAreBanned: 'You are banned'
    },
    nav: {
      shop: 'Store',
      library: 'Library',
      frames: 'Frames',
      admin: 'Admin',
      settings: 'Settings'
    },
    shop: {
      title: 'Game Catalog',
      publishGame: 'Publish Game',
      noGames: 'Games coming soon',
      buy: 'Buy',
      purchased: 'Purchased',
      notEnoughMoney: 'Insufficient balance',
      purchaseSuccess: 'Game purchased successfully!'
    },
    publish: {
      title: 'Publish Game',
      description: 'Fill out the form to submit your game for moderation',
      selectEngine: 'Select game engine',
      gdevelopFree: 'GDevelop game (free)',
      otherEnginePaid: 'Other engine game (50 ₽)',
      gameName: 'Game name',
      gameDescription: 'Description',
      genre: 'Genre',
      genrePlaceholder: 'Action, RPG, etc.',
      ageRating: 'Age rating',
      price: 'Price (₽)',
      logoUrl: 'Logo URL',
      fileUrl: 'Game file URL (.zip or .rar for PC)',
      contactEmail: 'Contact email',
      publishButton: 'Publish',
      publishSuccess: 'Game submitted for moderation! We will contact you via email.',
      publishError: 'Submission error',
      paymentRequired: 'Publishing a game on another engine requires 50 ₽',
      paymentSuccess: 'Payment successful! 50 ₽ deducted',
      pcGamesOnly: 'PC games only (.zip or .rar files)'
    },
    library: {
      title: 'My Library',
      noGames: 'You have no games yet',
      download: 'Download',
      delete: 'Delete (90% refund)',
      deleteSuccess: 'Game deleted! Refund:'
    },
    frames: {
      title: 'Frame Shop',
      shop: 'Shop',
      myFrames: 'My Frames',
      purchased: 'Purchased',
      buy: 'Buy',
      install: 'Install',
      remove: 'Remove',
      purchaseSuccess: 'Frame purchased!',
      installSuccess: 'Frame installed!',
      removeSuccess: 'Frame removed',
      notEnoughMoney: 'Insufficient funds'
    },
    profile: {
      title: 'Profile',
      username: 'Username',
      avatarUrl: 'Avatar URL',
      timeSpent: 'Time on site',
      hours: 'hours',
      updateSuccess: 'Profile updated!'
    },
    admin: {
      title: 'Admin Panel',
      users: 'Users',
      moderation: 'Game Moderation',
      createFrame: 'Create Frame',
      downloadSite: 'Download Site',
      searchPlaceholder: 'Search by username...',
      balance: 'Balance',
      verify: 'Verify',
      removeVerification: 'Remove ✓',
      ban: 'Ban',
      unban: 'Unban',
      balanceUpdated: 'Balance updated',
      userBanned: 'User banned',
      userUnbanned: 'User unbanned',
      userVerified: 'User verified',
      verificationRemoved: 'Verification removed',
      noPendingGames: 'No games pending moderation',
      gameEngine: 'Engine',
      gdevelop: 'GDevelop',
      otherEngine: 'Other engine',
      contactEmail: 'Email',
      downloadApk: 'Download file',
      approve: 'Approve',
      reject: 'Reject',
      gameApproved: 'Game approved',
      gameRejected: 'Game rejected',
      frameCreated: 'Frame created!',
      frameName: 'Frame name',
      frameImageUrl: 'Image URL',
      framePrice: 'Price (₽)',
      createFrameButton: 'Create Frame'
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      russian: 'Русский',
      english: 'English'
    },
    common: {
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save'
    }
  }
};

export const useTranslation = (lang: Language) => {
  return translations[lang];
};
