import { Low } from 'lowdb';
import { User, Story, Comment } from '../types';

// Адаптер для LocalStorage
class LocalStorageAdapter {
  private _key: string;

  constructor(key: string) {
    this._key = key;
  }

  async read(): Promise<any> {
    const value = localStorage.getItem(this._key);
    if (value === null) {
      return null;
    }
    return JSON.parse(value);
  }

  async write(data: any): Promise<void> {
    localStorage.setItem(this._key, JSON.stringify(data));
  }
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

// Создание адаптера и инициализация БД
const adapter = new LocalStorageAdapter('aiwriters_db');
// В новой версии lowdb конструктор принимает два аргумента: адаптер и defaultData
const db = new Low<DBSchema>(adapter, defaultData);

// Функция для загрузки данных
const loadDb = async () => {
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