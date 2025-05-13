import React from 'react';
import { AIRating } from '../types';

interface AIFeedbackProps {
  aiRating: AIRating | undefined;
}

const AIFeedback: React.FC<AIFeedbackProps> = ({ aiRating }) => {
  // Если нет рейтинга, показать заглушку
  if (!aiRating) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 style={{ color: 'var(--text-primary)' }}>Оценка ИИ</h3>
        </div>
        <div className="card-body">
          <p style={{ color: 'var(--text-secondary)' }}>ИИ пока не предоставил оценку для этого произведения.</p>
        </div>
      </div>
    );
  }

  // Функция для получения класса рейтинга
  const getRatingClass = (score: number) => {
    if (score >= 8) return { color: 'var(--success-color)' };
    if (score >= 5) return { color: 'var(--accent-color)' };
    return { color: 'var(--danger-color)' };
  };

  // Убедимся, что массивы strengths и improvements существуют
  const strengths = aiRating.strengths || [];
  const improvements = aiRating.improvements || [];

  return (
    <div className="card">
      <div className="card-header">
        <h3 style={{ color: 'var(--text-primary)' }}>Оценка ИИ</h3>
      </div>
      <div className="card-body">
        <div className="feedback-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ ...getRatingClass(aiRating.overallScore), fontSize: '1.5rem', fontWeight: 'bold' }}>
              {aiRating.overallScore}/10
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              Популярность: {aiRating.popularity}/10
            </div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Общая оценка:</h4>
            <p style={{ color: 'var(--text-primary)' }}>{aiRating.feedback}</p>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Сильные стороны:</h4>
            {strengths.length > 0 ? (
              <ul style={{ paddingLeft: '20px', color: 'var(--text-primary)' }}>
                {strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>Нет информации о сильных сторонах.</p>
            )}
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Что можно улучшить:</h4>
            {improvements.length > 0 ? (
              <ul style={{ paddingLeft: '20px', color: 'var(--text-primary)' }}>
                {improvements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>Нет рекомендаций по улучшению.</p>
            )}
          </div>
          
          {aiRating.genre && (
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Определенный жанр:</h4>
              <p style={{ color: 'var(--text-primary)' }}>{aiRating.genre}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIFeedback; 