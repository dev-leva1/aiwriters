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
    <div className="x-create-story-page">
      <Navbar />
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          background: 'var(--background)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          overflow: 'hidden',
          marginTop: '20px'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
          }}>
            <button
              onClick={() => setCurrentTab('write')}
              style={{
                flex: 1,
                padding: '15px',
                background: 'transparent',
                border: 'none',
                borderBottom: currentTab === 'write' ? '2px solid var(--primary-color)' : 'none',
                color: currentTab === 'write' ? 'var(--primary-color)' : 'var(--text-primary)',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Создание
            </button>
            <button
              onClick={() => setCurrentTab('preview')}
              style={{
                flex: 1,
                padding: '15px',
                background: 'transparent',
                border: 'none',
                borderBottom: currentTab === 'preview' ? '2px solid var(--primary-color)' : 'none',
                color: currentTab === 'preview' ? 'var(--primary-color)' : 'var(--text-primary)',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Предпросмотр
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div style={{ 
              padding: '15px',
              margin: '15px',
              background: 'rgba(244, 33, 46, 0.1)',
              color: 'var(--danger-color)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </div>
            )}
            
          {/* Editor Container */}
          <div style={{ padding: '20px' }}>
            {/* Write Tab */}
            {currentTab === 'write' && (
            <form onSubmit={handleSubmit}>
                {/* Header with profile pic */}
                <div style={{ display: 'flex', marginBottom: '20px', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    marginRight: '15px'
                  }}>
                    <img 
                      src={user?.avatar || 'https://api.dicebear.com/6.x/avataaars/svg?seed=default'} 
                      alt="Аватар" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    {/* Visibility options */}
                    <div style={{ 
                      display: 'inline-flex',
                      padding: '0 10px',
                      height: '32px',
                      alignItems: 'center', 
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      color: 'var(--primary-color)',
                  fontWeight: 'bold', 
                      fontSize: '14px',
                      marginBottom: '15px',
                      cursor: 'pointer'
                    }}>
                      <span>Все</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '5px' }}>
                        <path d="M6 9l6 6 6-6"></path>
                      </svg>
                    </div>
                    
                    {/* Title input */}
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                      placeholder="Заголовок истории"
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        padding: '5px 0'
                      }}
                  required
                    />
                    
                    {/* Content textarea */}
                    <textarea
                      ref={contentRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onInput={handleTextareaInput}
                      placeholder="Расскажите свою историю..."
                  style={{ 
                        width: '100%',
                        minHeight: isExpanded ? '350px' : '150px',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '18px',
                        lineHeight: '1.6',
                        resize: 'none',
                        padding: '0',
                        marginBottom: '15px'
                      }}
                      required
                    />
                    
                    {/* Attachments preview */}
                    {attachmentPreviews.length > 0 && (
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: attachmentPreviews.length === 1 ? '1fr' : attachmentPreviews.length === 3 ? '1fr 1fr 1fr' : '1fr 1fr',
                        gap: '10px',
                        marginBottom: '20px',
                    border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        overflow: 'hidden'
                      }}>
                        {attachmentPreviews.map((preview, index) => (
                          <div key={index} style={{ position: 'relative', aspectRatio: '16/9' }}>
                            {preview !== 'file-icon' ? (
                              <img src={preview} alt="Превью" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ 
                                width: '100%', 
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'var(--background-light)'
                              }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                  <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                              </div>
                            )}
                            <button 
                              onClick={() => removeAttachment(index)}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: 'rgba(0, 0, 0, 0.6)',
                                border: 'none',
                                color: 'white',
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
                </div>

                {/* Toolbar */}
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '15px',
                  marginBottom: '15px'
                }}>
                  {/* Format buttons */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => insertFormat('bold')}
                      title="Жирный текст"
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}
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
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}
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
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}
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
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}
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
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}
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
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}
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
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}
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
                        style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}
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
                            background: 'var(--background-elevated)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '16px',
                            padding: '15px',
                            width: '300px',
                            zIndex: 10,
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
                          }}
                        >
                          <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Часто используемые</div>
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
                                  borderRadius: '4px'
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
              
                {/* Genre and Tags section */}
                <div style={{ 
                  marginBottom: '20px',
                  padding: '15px',
                  background: 'var(--background-light)',
                  borderRadius: '12px',
                }}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      Жанр
                    </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  style={{ 
                        width: '100%',
                        background: 'var(--background)',
                        color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                        padding: '10px',
                        borderRadius: '8px',
                    appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%231d9bf0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 10px center',
                        backgroundSize: '16px'
                  }}
                >
                  <option value="">Выберите жанр</option>
                  {genres.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      Теги (через запятую)
                    </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                      placeholder="Добавьте теги через запятую"
                  style={{ 
                        width: '100%',
                        background: 'var(--background)',
                        color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                        padding: '10px',
                        borderRadius: '8px'
                  }}
                />
                  </div>
              </div>
              
                {/* Character count and autosave status */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  color: 'var(--text-secondary)',
                  fontSize: '14px'
                }}>
                  <div>
                    {characterCount ? `${characterCount} символов • ${wordCount} слов` : ''}
                  </div>
                  <div>
                    {savedStatus && savedStatus}
                  </div>
              </div>
              
                {/* Submit and Actions */}
              <div style={{ 
                display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '20px'
                }}>
                  <button
                    type="button"
                    onClick={clearDraft}
                    style={{ 
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--danger-color)',
                      cursor: 'pointer',
                      padding: '10px'
                    }}
                  >
                    Очистить черновик
                  </button>
                  
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ 
                      background: 'var(--primary-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '10px 20px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                      gap: '8px'
                  }}
                >
                  {isSubmitting ? (
                    <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" strokeDasharray="30 30" strokeDashoffset="0">
                          <animateTransform 
                            attributeName="transform"
                            attributeType="XML"
                            type="rotate"
                            from="0 12 12"
                            to="360 12 12"
                            dur="1s"
                            repeatCount="indefinite"
                          />
                          </circle>
                      </svg>
                      Публикация...
                    </>
                  ) : (
                      'Опубликовать'
                  )}
                </button>
                </div>
              </form>
            )}

            {/* Preview Tab */}
            {currentTab === 'preview' && (
              <div>
                <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>{title || 'Название истории'}</h2>
                
                <div 
                  className="preview-content"
                  style={{ fontSize: '18px', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: previewContent || '<p>Предпросмотр содержимого будет отображаться здесь...</p>' }}
                />
                
                {attachmentPreviews.length > 0 && (
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: attachmentPreviews.length === 1 ? '1fr' : attachmentPreviews.length === 3 ? '1fr 1fr 1fr' : '1fr 1fr',
                    gap: '10px',
                    marginTop: '20px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    overflow: 'hidden'
                  }}>
                    {attachmentPreviews.map((preview, index) => (
                      <div key={index} style={{ position: 'relative', aspectRatio: '16/9' }}>
                        {preview !== 'file-icon' ? (
                          <img src={preview} alt="Превью" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ 
                            width: '100%', 
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--background-light)'
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {genre && (
                  <div style={{ 
                    display: 'inline-block',
                    marginTop: '20px',
                    padding: '5px 15px',
                    background: 'var(--primary-light)',
                    color: 'var(--primary-color)',
                    borderRadius: '9999px',
                    fontWeight: 'bold'
                  }}>
                    {genre}
                  </div>
                )}
                
                {tags && (
                  <div style={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginTop: '15px'
                  }}>
                    {tags.split(',').map((tag, index) => tag.trim() && (
                      <div key={index} style={{ 
                        color: 'var(--primary-color)',
                        fontSize: '14px'
                      }}>
                        #{tag.trim().replace(/\s+/g, '')}
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                  <button
                    onClick={() => setCurrentTab('write')}
                    style={{ 
                      background: 'transparent',
                      border: '1px solid var(--primary-color)',
                      color: 'var(--primary-color)',
                      borderRadius: '9999px',
                      padding: '10px 20px',
                      cursor: 'pointer'
                    }}
                  >
                    Вернуться к редактированию
                  </button>
                  
                  <button
                    onClick={handleSubmit}
                    style={{ 
                      background: 'var(--primary-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '10px 20px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Опубликовать
                </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Trending section - right sidebar */}
        {showTrends && (
          <div 
            style={{ 
              width: '300px',
              position: 'fixed',
              right: '20px',
              top: '80px',
              background: 'var(--background-light)',
              borderRadius: '16px',
              padding: '15px',
              border: '1px solid var(--border-color)'
            }}
          >
            <h3 style={{ marginBottom: '15px', fontSize: '20px', fontWeight: 'bold' }}>В тренде</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '10px' }}>Популярные хэштеги</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {trendingTags.map((tag, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      color: 'var(--primary-color)',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      const currentTags = tags.length > 0 ? tags.split(',').map(t => t.trim()) : [];
                      if (!currentTags.includes(tag)) {
                        const newTags = [...currentTags, tag].join(', ');
                        setTags(newTags);
                      }
                    }}
                  >
                    #{tag}
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '10px' }}>Советы по написанию</h4>
              <ul style={{ paddingLeft: '20px', color: 'var(--text-primary)', fontSize: '14px' }}>
                <li style={{ marginBottom: '8px' }}>Начните с яркого заголовка, который привлечет внимание</li>
                <li style={{ marginBottom: '8px' }}>Используйте форматирование для выделения важных моментов</li>
                <li style={{ marginBottom: '8px' }}>Добавьте изображение для большей выразительности</li>
                <li style={{ marginBottom: '8px' }}>Используйте соответствующие хэштеги для лучшего поиска</li>
              </ul>
            </div>
            
            <div>
              <button
                onClick={() => setShowTrends(false)}
                style={{ 
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '5px 0'
                }}
              >
                Скрыть блок
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateStoryPage; 