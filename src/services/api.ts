import axios from 'axios';
import { AIResponse, Story, Comment, UserDTO } from '../types';
import { db, generateStoryId, generateCommentId, loadDb } from './db';
import { authService } from './authService';

// Используем фейковый API ключ в примере
// В реальном приложении ключ должен храниться в .env файле
const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY || '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'; // Замените на реальный API ключ
const SITE_URL = window.location.origin; // Динамически определяем URL сайта
const SITE_NAME = 'AI Writers App';

const api = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'HTTP-Referer': SITE_URL,
    'X-Title': SITE_NAME,
    'Content-Type': 'application/json'
  }
});

export const getAIRating = async (story: Story): Promise<AIResponse> => {
  try {
    const response = await api.post('/chat/completions', {
      model: 'deepseek/deepseek-chat-v3-0324:free', // Можно использовать другие модели
      messages: [
        {
          role: 'system',
          content: `Ты строгий и требовательный литературный критик с многолетним опытом. Твоя задача - провести беспощадный и беспристрастный анализ произведения пользователя и дать ему детальную критическую оценку.

          Будь максимально честным и объективным. Не заботься о чувствах автора - твоя цель не похвалить, а указать на все недостатки работы и предложить конкретные пути улучшения. Даже если произведение кажется хорошим, найди в нём слабые места.
          
          Даже высоко оценённым работам всегда должны сопутствовать как минимум 3-5 конкретных рекомендаций по улучшению. Избегай общих фраз вроде "работайте над стилем" - давай точные практические советы.
          
          Оценивай произведение по следующим критериям:
          - Стиль и язык (грамотность, выбор слов, образность)
          - Структура и композиция (логика построения, развитие сюжета)
          - Оригинальность и творческий подход
          - Убедительность персонажей и диалогов
          - Соответствие жанру и целевой аудитории
          - Эмоциональное воздействие
          
          Структура ответа должна быть в JSON формате:
          {
            "rating": {
              "overallScore": число от 1 до 9 (избегай оценок 10, будь строг в оценках, крайне редко ставь оценки выше 7),
              "feedback": "краткий общий критический отзыв на произведение с акцентом на недостатки",
              "popularity": число от 1 до 8 (оценивай реалистично, избегай завышенных оценок),
              "strengths": ["сильная сторона 1", "сильная сторона 2", ...],
              "improvements": ["конкретная рекомендация 1", "конкретная рекомендация 2", "конкретная рекомендация 3", ...],
              "genre": "определи жанр произведения"
            },
            "comment": "развернутый критический комментарий к произведению от имени ИИ-критика, с глубоким анализом недостатков и примерами из текста",
            "aiPost": {
              "title": "заголовок для поста-обсуждения этого произведения",
              "content": "текст поста-обсуждения, который критически анализирует произведение и стимулирует дискуссию о его сильных и слабых сторонах"
            }
          }
          
          Важно: отвечай только в JSON формате, без дополнительных пояснений и маркеров кода.`
        },
        {
          role: 'user',
          content: `Заголовок: ${story.title}\n\nЖанр: ${story.genre || 'Не указан'}\n\nСодержание:\n${story.content}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const responseContent = response.data.choices[0].message.content;
    
    if (!responseContent) {
      return defaultErrorResponse();
    }
    
    // Удаляем маркеры форматирования markdown, если они есть
    let cleanedContent = responseContent;
    if (responseContent.includes('```')) {
      cleanedContent = responseContent
        .replace(/```json\n/g, '')
        .replace(/```\n/g, '')
        .replace(/```/g, '')
        .trim();
    }
    
    try {
      return JSON.parse(cleanedContent);
    } catch (jsonError) {
      console.error('Ошибка парсинга JSON:', jsonError, 'Содержимое:', cleanedContent);
      return defaultErrorResponse();
    }
  } catch (error) {
    console.error('Error getting AI rating:', error);
    return defaultErrorResponse();
  }
};

// Вспомогательная функция для возврата ответа по умолчанию при ошибке
const defaultErrorResponse = (): AIResponse => {
  return {
    rating: {
      overallScore: 5,
      feedback: 'Произошла ошибка при анализе произведения',
      popularity: 5,
      strengths: ['Не удалось определить'],
      improvements: ['Не удалось определить'],
      genre: 'Не удалось определить'
    }
  };
};

// API для работы с данными из базы данных
export const getStories = async (): Promise<Story[]> => {
  await loadDb();
  
  // Проверяем, что db.data не null
  if (!db.data) return [];
  
  // Получаем все истории и добавляем информацию об авторах
  const stories = [...db.data.stories].map(story => {
    const author = db.data?.users.find(user => user.id === story.authorId);
    if (author) {
      const { passwordHash, ...authorData } = author;
      story.author = authorData;
    }
    return story;
  });
  
  return stories;
};

export const getStoryById = async (id: string): Promise<Story | undefined> => {
  await loadDb();
  
  // Проверяем, что db.data не null
  if (!db.data) return undefined;
  
  const story = db.data.stories.find(story => story.id === id);
  if (!story) return undefined;
  
  // Добавляем информацию об авторе
  const author = db.data?.users.find(user => user.id === story.authorId);
  if (author) {
    const { passwordHash, ...authorData } = author;
    story.author = authorData;
  }
  
  // Добавляем информацию об авторах комментариев
  story.comments = story.comments.map(comment => {
    const commentAuthor = db.data?.users.find(user => user.id === comment.authorId);
    if (commentAuthor) {
      const { passwordHash, ...authorData } = commentAuthor;
      comment.author = authorData;
    }
    return comment;
  });
  
  return story;
};

export const createStory = async (story: Omit<Story, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments'>): Promise<Story> => {
  await loadDb();
  
  // Проверяем, что db.data не null
  if (!db.data) {
    throw new Error('База данных не доступна');
  }
  
  const newStory: Story = {
    ...story,
    id: generateStoryId(),
    likes: 0,
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Получение оценки от ИИ
  const aiResponse = await getAIRating(newStory);
  
  // Добавляем ИИ комментарий, если он есть
  if (aiResponse.comment) {
    const aiUser = db.data.users.find(user => user.username === 'AIAssistant');
    let aiUserId = '';
    
    // Если ИИ пользователя нет, создаем его
    if (!aiUser) {
      const newAiUser = {
        id: generateStoryId(), // Используем тот же генератор для простоты
        username: 'AIAssistant',
        email: 'ai@aiwriters.app',
        passwordHash: 'no_password',
        avatar: 'https://i.imgur.com/ci8VOO9.jpeg',
        bio: 'Искусственный интеллект, помогающий оценивать произведения',
        createdAt: new Date()
      };
      db.data.users.push(newAiUser);
      aiUserId = newAiUser.id;
    } else {
      aiUserId = aiUser.id;
    }
    
    const aiComment = {
      id: generateCommentId(),
      content: aiResponse.comment,
      authorId: aiUserId,
      storyId: newStory.id,
      isAI: true,
      createdAt: new Date()
    };
    
    newStory.comments = [aiComment];
    db.data.comments.push(aiComment);
  }
  
  // Добавляем оценку ИИ
  newStory.aiRating = aiResponse.rating;
  
  // Если ИИ создал пост-обсуждение, добавляем его
  if (aiResponse.aiPost) {
    const aiUser = db.data.users.find(user => user.username === 'AIAssistant');
    let aiUserId = aiUser ? aiUser.id : (db.data.users[0]?.id || 'user_1');
    
    const aiDiscussionPost: Story = {
      id: generateStoryId(),
      title: aiResponse.aiPost.title,
      content: aiResponse.aiPost.content,
      authorId: aiUserId,
      likes: 0,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    db.data.stories.push(aiDiscussionPost);
  }
  
  // Добавляем информацию об авторе
  const author = db.data.users.find(user => user.id === newStory.authorId);
  if (author) {
    const { passwordHash, ...authorData } = author;
    newStory.author = authorData;
  }
  
  db.data.stories.push(newStory);
  await db.write();
  
  return newStory;
};

export const addComment = async (storyId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
  await loadDb();
  
  // Проверяем, что db.data не null
  if (!db.data) {
    throw new Error('База данных не доступна');
  }
  
  // Создаем новый комментарий
  const newComment: Comment = {
    ...comment,
    id: generateCommentId(),
    createdAt: new Date()
  };
  
  // Находим историю для добавления комментария
  const storyIndex = db.data.stories.findIndex(s => s.id === storyId);
  if (storyIndex !== -1) {
    db.data.stories[storyIndex].comments.push(newComment);
  }
  
  // Добавляем комментарий в общий список
  db.data.comments.push(newComment);
  
  // Добавляем информацию об авторе
  const author = db.data.users.find(user => user.id === newComment.authorId);
  if (author) {
    const { passwordHash, ...authorData } = author;
    newComment.author = authorData;
  }
  
  await db.write();
  return newComment;
};

export const likeStory = async (storyId: string): Promise<Story | undefined> => {
  await loadDb();
  
  // Проверяем, что db.data не null
  if (!db.data) return undefined;
  
  // Находим историю для добавления лайка
  const storyIndex = db.data.stories.findIndex(s => s.id === storyId);
  if (storyIndex !== -1) {
    db.data.stories[storyIndex].likes += 1;
    await db.write();
    
    // Возвращаем обновленную историю
    const story = db.data.stories[storyIndex];
    
    // Добавляем информацию об авторе
    const author = db.data.users.find(user => user.id === story.authorId);
    if (author) {
      const { passwordHash, ...authorData } = author;
      story.author = authorData;
    }
    
    return story;
  }
  
  return undefined;
};

// Получение историй пользователя
export const getUserStories = async (userId: string): Promise<Story[]> => {
  await loadDb();
  
  // Проверяем, что db.data не null
  if (!db.data) return [];
  
  // После проверки на null, TypeScript должен понимать, что db.data не null
  const dbData = db.data; // создаем копию переменной, чтобы TypeScript не терял информацию о типе
  
  const userStories = dbData.stories
    .filter(story => story.authorId === userId)
    .map(story => {
      const author = dbData.users.find(user => user.id === story.authorId);
      if (author) {
        const { passwordHash, ...authorData } = author;
        story.author = authorData;
      }
      return story;
    });
  
  return userStories;
};

// Создание/получение AI пользователя
export const getOrCreateAIUser = async (): Promise<UserDTO> => {
  await loadDb();
  
  if (!db.data) {
    throw new Error('База данных не доступна');
  }
  
  // После проверки на null, TypeScript должен понимать, что db.data не null
  const dbData = db.data; // создаем копию переменной, чтобы TypeScript не терял информацию о типе
  
  let aiUser = dbData.users.find(user => user.username === 'AIAssistant');
  
  // Если ИИ пользователя нет, создаем его
  if (!aiUser) {
    const newAiUser = {
      id: generateStoryId(),
      username: 'AIAssistant',
      email: 'ai@aiwriters.app',
      passwordHash: 'no_password',
      avatar: 'https://i.imgur.com/ci8VOO9.jpeg',
      bio: 'Искусственный интеллект, помогающий оценивать произведения',
      createdAt: new Date()
    };
    dbData.users.push(newAiUser);
    await db.write();
    
    const { passwordHash, ...aiUserData } = newAiUser;
    return aiUserData;
  } else {
    const { passwordHash, ...aiUserData } = aiUser;
    return aiUserData;
  }
}; 