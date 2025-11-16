import React, { useState, useCallback, useEffect } from 'react';
import { generateInitialPost, regenerateText, regenerateImage } from './services/geminiService';
import { TONES, ASPECT_RATIOS } from './constants';
import type { SocialPost, Tone, Theme, AspectRatio } from './types';
import SocialPostCard from './components/SocialPostCard';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { SunIcon } from './components/icons/SunIcon';
import { MoonIcon } from './components/icons/MoonIcon';
import { WarningIcon } from './components/icons/WarningIcon';


const App: React.FC = () => {
  const [idea, setIdea] = useState<string>('');
  const [tone, setTone] = useState<Tone>('Professional');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [generatedContent, setGeneratedContent] = useState<SocialPost[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Generating Content');
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('social-spark-theme') as Theme | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('social-spark-theme', newTheme);
  };

  const handleGenerate = useCallback(async () => {
    if (!idea.trim()) {
      setError('Please enter a content idea.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    const messages = [
      'Connecting to creative AI...',
      'Drafting compelling posts...',
      'Generating unique visuals...',
      'Assembling your content...',
      'Finalizing creations...',
    ];
    let messageIndex = 0;
    setLoadingMessage(messages[messageIndex]);

    const intervalId = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 2500);

    try {
      const postTemplates = await generateInitialPost(idea, tone);
      
      const postsWithImages = await Promise.all(
        postTemplates.map(async (template, index) => {
          await new Promise(res => setTimeout(res, index * 200)); 
          const imageBase64 = await regenerateImage(template.postText, template.hashtags, aspectRatio);
          return {
            ...template,
            id: Date.now().toString() + index,
            image: `data:image/jpeg;base64,${imageBase64.imageBytes}`,
            imagePrompt: imageBase64.imagePrompt,
          };
        })
      );
      
      setGeneratedContent(postsWithImages);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      clearInterval(intervalId);
      setIsLoading(false);
    }
  }, [idea, tone, aspectRatio]);

  const handleRegenerateText = useCallback(async (postId: string) => {
    const originalPost = generatedContent?.find(p => p.id === postId);
    if (!originalPost) return;

    const { postText, hashtags } = await regenerateText(idea, tone, originalPost.postText);
    setGeneratedContent(prev => 
      prev ? prev.map(p => p.id === postId ? { ...p, postText, hashtags } : p) : null
    );
  }, [generatedContent, idea, tone]);
  
  const handleRegenerateImage = useCallback(async (postId: string) => {
    const originalPost = generatedContent?.find(p => p.id === postId);
    if (!originalPost) return;

    const { imagePrompt, imageBytes } = await regenerateImage(originalPost.postText, originalPost.hashtags, aspectRatio);
    const image = `data:image/jpeg;base64,${imageBytes}`;
    setGeneratedContent(prev => 
      prev ? prev.map(p => p.id === postId ? { ...p, imagePrompt, image } : p) : null
    );
  }, [generatedContent, aspectRatio]);


  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col min-h-full max-w-7xl mx-auto w-full">
        <header className="text-center mb-10 pt-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <SparklesIcon className="w-9 h-9 text-[var(--color-accent)]" />
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-violet-500 to-fuchsia-500 text-transparent bg-clip-text">
              Social Spark AI
            </h1>
          </div>
          <p className="text-lg text-[var(--color-text-secondary)]">
            Your personal AI partner for creating standout social media content.
          </p>
        </header>

        <main className="flex-grow">
          <div className="bg-[var(--color-bg-glass)] backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-[var(--color-border)] max-w-2xl mx-auto">
            <div className="space-y-6">
              <div>
                <label htmlFor="idea" className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">
                  1. Enter your content idea
                </label>
                <textarea
                  id="idea"
                  rows={3}
                  className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-3 text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-ring)] focus:border-[var(--color-accent)] transition-all placeholder-[var(--color-placeholder)]"
                  placeholder="e.g., Launching a new sustainable coffee brand..."
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">
                      2. Select a tone
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {TONES.map((t) => (
                        <button
                          key={t}
                          onClick={() => setTone(t)}
                          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg-secondary)] focus:ring-[var(--color-ring)]
                            ${tone === t ? 'bg-[var(--color-accent)] text-[var(--color-accent-content)] shadow-lg shadow-[var(--color-accent-shadow)]' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">
                      3. Choose an aspect ratio
                    </label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {ASPECT_RATIOS.map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setAspectRatio(ratio)}
                          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg-secondary)] focus:ring-[var(--color-ring)]
                            ${aspectRatio === ratio ? 'bg-[var(--color-accent)] text-[var(--color-accent-content)] shadow-lg shadow-[var(--color-accent-shadow)]' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'}`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--color-accent-shadow)]"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="transition-all duration-300">{loadingMessage}</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Generate Content
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-8 flex items-start gap-4 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg max-w-2xl mx-auto animate-fade-in">
              <WarningIcon className="w-6 h-6 flex-shrink-0 mt-0.5 text-red-400" />
              <div>
                  <h3 className="font-bold text-red-200">Request Failed</h3>
                  <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {generatedContent && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
               {generatedContent.map((post, index) => (
                  <div
                    key={post.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms`}}
                  >
                    <SocialPostCard 
                      post={post} 
                      onRegenerateText={() => handleRegenerateText(post.id)}
                      onRegenerateImage={() => handleRegenerateImage(post.id)}
                    />
                  </div>
               ))}
            </div>
          )}
        </main>
      
        <footer className="text-center py-6 mt-10 text-sm text-[var(--color-text-secondary)]">
          <div className="flex items-center justify-center gap-4 mb-4">
            <button onClick={() => handleSetTheme('light')} aria-label="Light theme" className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'bg-[var(--color-accent)] text-[var(--color-accent-content)]' : 'bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border)]'}`}><SunIcon className="w-5 h-5" /></button>
            <button onClick={() => handleSetTheme('dark')} aria-label="Dark theme" className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-[var(--color-accent)] text-[var(--color-accent-content)]' : 'bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border)]'}`}><MoonIcon className="w-5 h-5" /></button>
          </div>
          <p>&copy; {new Date().getFullYear()} Social Spark AI. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;