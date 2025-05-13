import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStory } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const CreateStoryPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [genre, setGenre] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [savedStatus, setSavedStatus] = useState('');
  const [showToolbar, setShowToolbar] = useState(false);
  const [currentTab, setCurrentTab] = useState('write');
  const [previewContent, setPreviewContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTrends, setShowTrends] = useState(true);
  
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Проверка авторизации
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Подсчет слов и символов
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharacterCount(content.length);
    
    // Автосохранение в localStorage
    if (content.trim() || title.trim()) {
      const storyDraft = { title, content, genre, tags };
      localStorage.setItem('storyDraft', JSON.stringify(storyDraft));
      setSavedStatus('Черновик сохранен');
      
      const timer = setTimeout(() => {
        setSavedStatus('');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [title, content, genre, tags]);
  
  // Загрузка черновика при первом рендере
  useEffect(() => {
    const savedDraft = localStorage.getItem('storyDraft');
    if (savedDraft) {
      try {
        const { title: savedTitle, content: savedContent, genre: savedGenre, tags: savedTags } = JSON.parse(savedDraft);
        setTitle(savedTitle || '');
        setContent(savedContent || '');
        setGenre(savedGenre || '');
        setTags(savedTags || '');
      } catch (error) {
        console.error('Ошибка при загрузке черновика:', error);
      }
    }
  }, []);
  
  // Обновление режима предпросмотра
  useEffect(() => {
    if (currentTab === 'preview') {
      // Форматирование текста для предпросмотра
      let formattedContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
        .replace(/\*(.*?)\*/g, '<em>$1</em>')            // *italic*
        .replace(/#{3}(.*?)\n/g, '<h3>$1</h3>')         // ### заголовок
        .replace(/#{2}(.*?)\n/g, '<h2>$1</h2>')         // ## заголовок
        .replace(/#{1}(.*?)\n/g, '<h1>$1</h1>')         // # заголовок
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>') // [текст](ссылка)
        .replace(/`([^`]+)`/g, '<code>$1</code>')       // `code`
        .replace(/\n\n/g, '</p><p>')                    // Параграфы
        .replace(/\n/g, '<br>');                        // Переносы строк
      
      formattedContent = `<p>${formattedContent}</p>`;
      setPreviewContent(formattedContent);
    }
  }, [content, currentTab]);
  
  // Закрытие эмодзи-пикера при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Пожалуйста, заполните название и содержание истории');
      return;
    }
    
    if (!user) {
      setError('Вы должны быть авторизованы для публикации историй');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const newStory = await createStory({
        title,
        content,
        authorId: user.id,
        genre: genre || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined
      });
      
      // Очистка черновика после успешной публикации
      localStorage.removeItem('storyDraft');
      
      navigate(`/stories/${newStory.id}`);
    } catch (error) {
      console.error('Failed to create story:', error);
      setError('Произошла ошибка при создании истории. Пожалуйста, попробуйте еще раз.');
      setIsSubmitting(false);
    }
  };
  
  // Функция для вставки форматированного текста
  const insertFormat = (format: string) => {
    if (!contentRef.current) return;
    
    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    let newCursorPosition = 0;
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        newCursorPosition = start + 2 + selectedText.length;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        newCursorPosition = start + 1 + selectedText.length;
        break;
      case 'heading':
        formattedText = `\n## ${selectedText}\n`;
        newCursorPosition = start + 4 + selectedText.length;
        break;
      case 'quote':
        formattedText = `\n> ${selectedText.replace(/\n/g, '\n> ')}\n`;
        newCursorPosition = start + 3 + selectedText.length;
        break;
      case 'list':
        formattedText = `\n- ${selectedText.replace(/\n/g, '\n- ')}\n`;
        newCursorPosition = start + 3 + selectedText.length;
        break;
      case 'link':
        formattedText = `[${selectedText || 'Ссылка'}](URL)`;
        newCursorPosition = start + selectedText.length + 3;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        newCursorPosition = start + 1 + selectedText.length;
        break;
      default:
        return;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    
    // Установка фокуса и позиции курсора
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(selectedText ? newCursorPosition : start + 2, selectedText ? newCursorPosition : end + 2);
    }, 0);
  };
  
  // Обработка выбора файлов
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files);
    if (attachments.length + newFiles.length > 4) {
      setError('Можно прикрепить не более 4 файлов');
      return;
    }
    
    setAttachments(prev => [...prev, ...newFiles]);
    
    // Создаем превью для изображений
    newFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachmentPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        // Для не-изображений используем иконку файла
        setAttachmentPreviews(prev => [...prev, 'file-icon']);
      }
    });
  };
  
  // Удаление прикрепленного файла
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  // Вставка эмодзи
  const insertEmoji = (emoji: string) => {
    if (!contentRef.current) return;
    
    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newContent = content.substring(0, start) + emoji + content.substring(end);
    setContent(newContent);
    
    // Перемещаем курсор после эмодзи
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + emoji.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
    
    setShowEmojiPicker(false);
  };
  
  // Очистка черновика
  const clearDraft = () => {
    if (window.confirm('Вы уверены, что хотите очистить черновик? Это действие нельзя отменить.')) {
      localStorage.removeItem('storyDraft');
      setTitle('');
      setContent('');
      setGenre('');
      setTags('');
      setAttachments([]);
      setAttachmentPreviews([]);
      setSavedStatus('Черновик удален');
      
      setTimeout(() => {
        setSavedStatus('');
      }, 3000);
    }
  };
  
  // Автоматическое расширение текстового поля при вводе
  const handleTextareaInput = () => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  };

  // Жанры для выбора
  const genres = [
    'Фантастика',
    'Фэнтези',
    'Детектив',
    'Триллер',
    'Ужасы',
    'Романтика',
    'Приключения',
    'Исторический',
    'Научно-популярный',
    'Юмор',
    'Драма',
    'Другое'
  ];
  
  // Трендовые хэштеги для вдохновения
  const trendingTags = [
    'литература2023',
    'авторскаяистория',
    'молодойавтор',
    'новыйжанр',
    'современнаяпроза',
    'мирбудущего',
    'творческийпроцесс',
    'короткийрассказ'
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Создание истории</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Поделитесь своим творчеством с сообществом</p>
        </div>
        
        {error && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: 'rgba(224, 36, 36, 0.1)', 
            borderRadius: '8px', 
            color: 'var(--danger-color)', 
            marginBottom: '20px',
            border: '1px solid var(--danger-color)'
          }}>
            {error}
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          gap: '20px',
          flexDirection: isExpanded ? 'column' : 'row'
        }}>
          <div style={{ 
            flex: 3,
            backgroundColor: 'var(--card-bg)',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)'
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="title" style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>
                  Название
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-control"
                  placeholder="Введите название вашей истории"
                  style={{ 
                    width: '100%',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '1.1rem'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <label htmlFor="content" style={{ color: 'var(--text-secondary)' }}>
                    Содержание
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setCurrentTab('write')}
                      style={{ 
                        background: 'transparent',
                        border: 'none',
                        color: currentTab === 'write' ? 'var(--accent-color)' : 'var(--text-secondary)',
                        fontWeight: currentTab === 'write' ? 'bold' : 'normal',
                        cursor: 'pointer',
                        padding: '0 10px'
                      }}
                    >
                      Написание
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentTab('preview')}
                      style={{ 
                        background: 'transparent',
                        border: 'none',
                        color: currentTab === 'preview' ? 'var(--accent-color)' : 'var(--text-secondary)',
                        fontWeight: currentTab === 'preview' ? 'bold' : 'normal',
                        cursor: 'pointer',
                        padding: '0 10px'
                      }}
                    >
                      Предпросмотр
                    </button>
                  </div>
                </div>
                
                <div style={{ 
                  position: 'relative',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--input-bg)',
                  overflow: 'hidden'
                }}>
                  {currentTab === 'write' ? (
                    <>
                      <textarea
                        id="content"
                        ref={contentRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Расскажите свою историю..."
                        onFocus={() => setShowToolbar(true)}
                        style={{ 
                          width: '100%',
                          padding: '15px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: 'var(--text-primary)',
                          minHeight: '300px',
                          resize: 'vertical',
                          outline: 'none',
                          fontSize: '1rem',
                          lineHeight: '1.6',
                          fontFamily: 'inherit'
                        }}
                      ></textarea>
                      
                      {/* Attachments preview */}
                      <div style={{ padding: '0 15px' }}>
                        {attachmentPreviews.length > 0 && (
                          <div style={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                            gap: '10px',
                            marginBottom: '15px'
                          }}>
                            {attachmentPreviews.map((preview, index) => (
                              <div 
                                key={index} 
                                style={{ 
                                  position: 'relative',
                                  aspectRatio: '1/1',
                                  borderRadius: '8px',
                                  overflow: 'hidden'
                                }}
                              >
                                <img 
                                  src={preview} 
                                  alt={`Attachment ${index + 1}`} 
                                  style={{ 
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }} 
                                />
                                <button
                                  type="button"
                                  onClick={() => removeAttachment(index)}
                                  style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: 'var(--bg-secondary)',
                                    border: 'none',
                                    color: 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div 
                      dangerouslySetInnerHTML={{ __html: previewContent }}
                      style={{ 
                        padding: '15px',
                        color: 'var(--text-primary)',
                        minHeight: '300px',
                        fontSize: '1rem',
                        lineHeight: '1.6'
                      }}
                    ></div>
                  )}
                  
                  {/* Toolbar */}
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '15px',
                    marginBottom: '15px',
                    padding: '15px'
                  }}>
                    {/* Format buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => insertFormat('bold')}
                        title="Жирный текст"
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                        </svg>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => insertFormat('italic')}
                        title="Курсив"
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="19" y1="4" x2="10" y2="4"></line>
                          <line x1="14" y1="20" x2="5" y2="20"></line>
                          <line x1="15" y1="4" x2="9" y2="20"></line>
                        </svg>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => insertFormat('heading')}
                        title="Заголовок"
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 4v16"></path>
                          <path d="M18 4v16"></path>
                          <path d="M6 12h12"></path>
                        </svg>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => insertFormat('list')}
                        title="Список"
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="8" y1="6" x2="21" y2="6"></line>
                          <line x1="8" y1="12" x2="21" y2="12"></line>
                          <line x1="8" y1="18" x2="21" y2="18"></line>
                          <line x1="3" y1="6" x2="3.01" y2="6"></line>
                          <line x1="3" y1="12" x2="3.01" y2="12"></line>
                          <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => insertFormat('link')}
                        title="Ссылка"
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => insertFormat('code')}
                        title="Код"
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="16 18 22 12 16 6"></polyline>
                          <polyline points="8 6 2 12 8 18"></polyline>
                        </svg>
                      </button>
                    </div>
                    
                    <div style={{ flex: 1 }}></div>
                    
                    {/* Media and emoji buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        title="Добавить изображение"
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </button>
                      
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        accept="image/*" 
                        multiple 
                        style={{ display: 'none' }} 
                      />
                      
                      <div style={{ position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          title="Эмодзи"
                          style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                            <line x1="9" y1="9" x2="9.01" y2="9"></line>
                            <line x1="15" y1="9" x2="15.01" y2="9"></line>
                          </svg>
                        </button>
                        
                        {showEmojiPicker && (
                          <div 
                            ref={emojiPickerRef}
                            style={{ 
                              position: 'absolute',
                              bottom: '30px',
                              right: '0',
                              background: 'var(--card-bg)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '16px',
                              padding: '15px',
                              width: '300px',
                              zIndex: 10,
                              boxShadow: 'var(--shadow)'
                            }}
                          >
                            <div style={{ marginBottom: '10px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Часто используемые</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '5px' }}>
                              {['😊', '👍', '🔥', '❤️', '😂', '🤔', '👏', '✨', '🎉', '🚀', '💯', '🙏', '😍', '💪', '🤩', '😎'].map((emoji, i) => (
                                <button 
                                  key={i} 
                                  onClick={() => insertEmoji(emoji)}
                                  style={{ 
                                    background: 'transparent', 
                                    border: 'none', 
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    padding: '5px',
                                    borderRadius: '4px',
                                    transition: 'background-color 0.2s ease'
                                  }}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="genre" style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>
                  Жанр (необязательно)
                </label>
                <select
                  id="genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="form-control"
                  style={{ 
                    width: '100%',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="">Выберите жанр</option>
                  <option value="Фэнтези">Фэнтези</option>
                  <option value="Научная фантастика">Научная фантастика</option>
                  <option value="Детектив">Детектив</option>
                  <option value="Роман">Роман</option>
                  <option value="Триллер">Триллер</option>
                  <option value="Ужасы">Ужасы</option>
                  <option value="Приключения">Приключения</option>
                  <option value="Другое">Другое</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="tags" style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>
                  Теги (через запятую, необязательно)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="form-control"
                  placeholder="фантастика, дракон, магия"
                  style={{ 
                    width: '100%',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <button
                    type="button"
                    onClick={clearDraft}
                    style={{ 
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    Очистить черновик
                  </button>
                  
                  {savedStatus && (
                    <span style={{ 
                      marginLeft: '10px', 
                      fontSize: '14px',
                      color: 'var(--success-color)'
                    }}>
                      {savedStatus}
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    fontSize: '14px',
                    color: 'var(--text-secondary)'
                  }}>
                    {wordCount} слов ({characterCount} символов)
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || !title.trim() || !content.trim()}
                    style={{ 
                      padding: '10px 20px',
                      backgroundColor: 'var(--accent-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '9999px',
                      fontWeight: 'bold',
                      cursor: isSubmitting || !title.trim() || !content.trim() ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? 'Публикация...' : 'Опубликовать'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStoryPage; 