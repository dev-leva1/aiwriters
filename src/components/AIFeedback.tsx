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
          <h3>Оценка ИИ</h3>
        </div>
        <div className="card-body">
          <p>ИИ пока не предоставил оценку для этого произведения.</p>
        </div>
      </div>
    );
  }

  // Функция для получения класса рейтинга
  const getRatingClass = (score: number) => {
    if (score >= 8) return 'rating-high';
    if (score >= 5) return 'rating-medium';
    return 'rating-low';
  };

  // Убедимся, что массивы strengths и improvements существуют
  const strengths = aiRating.strengths || [];
  const improvements = aiRating.improvements || [];

  return (
    <div className="card">
      <div className="card-header">
        <h3>Оценка ИИ</h3>
      </div>
      <div className="card-body">
        <div className="feedback-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div className={`rating ${getRatingClass(aiRating.overallScore)}`} style={{ fontSize: '1.5rem' }}>
              {aiRating.overallScore}/10
            </div>
            <div className="rating">
              Популярность: {aiRating.popularity}/10
            </div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <h4>Общая оценка:</h4>
            <p>{aiRating.feedback}</p>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <h4>Сильные стороны:</h4>
            {strengths.length > 0 ? (
              <ul>
                {strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            ) : (
              <p>Нет информации о сильных сторонах.</p>
            )}
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <h4>Что можно улучшить:</h4>
            {improvements.length > 0 ? (
              <ul>
                {improvements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            ) : (
              <p>Нет рекомендаций по улучшению.</p>
            )}
          </div>
          
          {aiRating.genre && (
            <div>
              <h4>Определенный жанр:</h4>
              <p>{aiRating.genre}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIFeedback; 