import { User, Story, Comment } from '../types';

// Тип для Low из lowdb
interface Low<T> {
  data: T | null;
  read: () => Promise<void>;
  write: () => Promise<void>;
}

// Определение структуры данных
interface DBSchema {
  users: User[];
  stories: Story[];
  comments: Comment[];
  sequences: {
    userId: number;
    storyId: number;
    commentId: number;
  };
}

// Инициализация с пустыми данными
const defaultData: DBSchema = {
  users: [],
  stories: [],
  comments: [],
  sequences: {
    userId: 1,
    storyId: 1,
    commentId: 1
  }
};

// Класс адаптера для LocalStorage 
class LocalStorageAdapter {
  private key: string;
  
  constructor(key: string) {
    this.key = key;
  }
  
  async read(): Promise<DBSchema | null> {
    const data = localStorage.getItem(this.key);
    if (data === null) {
      return null;
    }
    try {
      return JSON.parse(data) as DBSchema;
    } catch (error) {
      return null;
    }
  }
  
  async write(data: DBSchema): Promise<void> {
    localStorage.setItem(this.key, JSON.stringify(data));
  }
}

// Создание адаптера
const adapter = new LocalStorageAdapter('aiwriters_db');

// Создадим заглушку для db, пока не загрузим настоящий объект
let db: Low<DBSchema> = {
  data: null,
  read: async () => { /* заглушка, ничего не возвращает */ },
  write: async () => { /* заглушка, ничего не возвращает */ }
};

// Асинхронно инициализируем db
let isDbInitialized = false;
const initDb = async () => {
  if (isDbInitialized) return;
  
  try {
    // Динамический импорт lowdb
    const { Low } = await import('lowdb');
    db = new Low<DBSchema>(adapter);
    isDbInitialized = true;
  } catch (error) {
    console.error('Ошибка при импорте lowdb:', error);
  }
};

// Функция для загрузки данных
const loadDb = async () => {
  await initDb();
  
  try {
    await db.read();
    // Если данных нет, будут использованы defaultData
    if (db.data === null) {
      db.data = defaultData;
      await db.write();
    }
  } catch (error) {
    console.error('Ошибка при загрузке базы данных:', error);
    db.data = defaultData;
    await db.write();
  }
};

// Функции для генерации ID
const generateUserId = (): string => {
  if (!db.data) return 'user_1';
  const id = `user_${db.data.sequences.userId}`;
  db.data.sequences.userId += 1;
  return id;
};

const generateStoryId = (): string => {
  if (!db.data) return 'story_1';
  const id = `story_${db.data.sequences.storyId}`;
  db.data.sequences.storyId += 1;
  return id;
};

const generateCommentId = (): string => {
  if (!db.data) return 'comment_1';
  const id = `comment_${db.data.sequences.commentId}`;
  db.data.sequences.commentId += 1;
  return id;
};

// Загружаем базу данных при импорте модуля
loadDb();

// Экспорт функций и объекта базы данных
export {
  db,
  loadDb,
  generateUserId,
  generateStoryId,
  generateCommentId
}; 