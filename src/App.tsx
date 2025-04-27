import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateStoryPage from './pages/CreateStoryPage';
import StoryDetailPage from './pages/StoryDetailPage';
import ProfilePage from './pages/ProfilePage';
import MyStoriesPage from './pages/MyStoriesPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/create-story" element={<CreateStoryPage />} />
      <Route path="/stories/:id" element={<StoryDetailPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/my-stories" element={<MyStoriesPage />} />
    </Routes>
  );
}

export default App;
