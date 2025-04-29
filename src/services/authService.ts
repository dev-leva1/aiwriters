import bcrypt from 'bcryptjs';
import { db, generateUserId, loadDb } from './db';
import { User, UserDTO, LoginCredentials, RegisterData, AuthResponse } from '../types';

// Константы
const SALT_ROUNDS = 10;
const LOCAL_STORAGE_KEY = 'ai_writers_auth';

// Вспомогательные функции
const convertToUserDTO = (user: User): UserDTO => {
  const { passwordHash, ...userDTO } = user;
  return userDTO;
};

// Сервис аутентификации
export const authService = {
  // Регистрация нового пользователя
  async register(data: RegisterData): Promise<AuthResponse> {
    await loadDb();
    
    if (!db.data) {
      throw new Error('База данных не доступна');
    }
    
    // После проверки на null, TypeScript должен понимать, что db.data не null
    const dbData = db.data;
    
    // Проверка, существует ли пользователь с таким email
    const existingUser = dbData.users.find(user => user.email === data.email);
    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }

    // Хэширование пароля
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    
    // Создание нового пользователя
    const newUser: User = {
      id: generateUserId(),
      username: data.username,
      email: data.email,
      passwordHash,
      avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${data.username}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Сохранение пользователя в базе
    dbData.users.push(newUser);
    await db.write();
    
    // Возвращаем DTO пользователя без пароля
    const userDTO = convertToUserDTO(newUser);
    
    // Сохраняем информацию о пользователе в localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userDTO));
    
    return { user: userDTO };
  },
  
  // Вход пользователя
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await loadDb();
    
    if (!db.data) {
      throw new Error('База данных не доступна');
    }
    
    // После проверки на null, TypeScript должен понимать, что db.data не null
    const dbData = db.data;
    
    // Поиск пользователя по email
    const user = dbData.users.find(user => user.email === credentials.email);
    if (!user) {
      throw new Error('Неверный email или пароль');
    }
    
    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Неверный email или пароль');
    }
    
    // Возвращаем DTO пользователя без пароля
    const userDTO = convertToUserDTO(user);
    
    // Сохраняем информацию о пользователе в localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userDTO));
    
    return { user: userDTO };
  },
  
  // Выход пользователя
  logout(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  },
  
  // Получение текущего пользователя из localStorage
  getCurrentUser(): UserDTO | null {
    const userData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!userData) {
      return null;
    }
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Ошибка при разборе данных пользователя:', error);
      return null;
    }
  },
  
  // Проверка аутентификации
  isAuthenticated(): boolean {
    return Boolean(this.getCurrentUser());
  },
  
  // Обновление профиля пользователя
  async updateProfile(userId: string, data: Partial<UserDTO>): Promise<UserDTO> {
    await loadDb();
    
    if (!db.data) {
      throw new Error('База данных не доступна');
    }
    
    // После проверки на null, TypeScript должен понимать, что db.data не null
    const dbData = db.data;
    
    // Поиск пользователя по ID
    const userIndex = dbData.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      throw new Error('Пользователь не найден');
    }
    
    // Обновление данных пользователя
    const user = dbData.users[userIndex];
    const updatedUser = {
      ...user,
      ...data,
      updatedAt: new Date()
    };
    
    dbData.users[userIndex] = updatedUser;
    await db.write();
    
    // Возвращаем обновленного пользователя
    const userDTO = convertToUserDTO(updatedUser);
    
    // Обновляем данные в localStorage
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userDTO));
    }
    
    return userDTO;
  },
  
  // Изменение пароля
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    await loadDb();
    
    if (!db.data) {
      throw new Error('База данных не доступна');
    }
    
    // После проверки на null, TypeScript должен понимать, что db.data не null
    const dbData = db.data;
    
    // Поиск пользователя по ID
    const userIndex = dbData.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      throw new Error('Пользователь не найден');
    }
    
    const user = dbData.users[userIndex];
    
    // Проверка текущего пароля
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Текущий пароль неверен');
    }
    
    // Хэширование нового пароля
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Обновление пароля
    dbData.users[userIndex] = {
      ...user,
      passwordHash,
      updatedAt: new Date()
    };
    
    await db.write();
    return true;
  },
  
  // Получение пользователя по ID
  async getUserById(userId: string): Promise<UserDTO | null> {
    await loadDb();
    
    if (!db.data) {
      return null;
    }
    
    // После проверки на null, TypeScript должен понимать, что db.data не null
    const dbData = db.data;
    
    const user = dbData.users.find(user => user.id === userId);
    if (!user) {
      return null;
    }
    
    return convertToUserDTO(user);
  }
}; 