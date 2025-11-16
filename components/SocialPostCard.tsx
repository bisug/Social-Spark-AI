import React, { useState, useEffect } from 'react';
import type { SocialPost } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { ShareIcon } from './icons/ShareIcon';
import { EditIcon } from './icons/EditIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface SocialPostCardProps {
  post: SocialPost;
  onRegenerateText: () => Promise<void>;
  onRegenerateImage: () => Promise<void>;
}

const SocialPostCard: React.FC<SocialPostCardProps> = ({ post, onRegenerateText, onRegenerateImage }) => {
  const [copied, setCopied] = useState(false);
  const [isShareSupported, setIsShareSupported] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(post.postText);
  const [editedHashtags, setEditedHashtags] = useState(post.hashtags);
  const [isTextRegenerating, setIsTextRegenerating] = useState(false);
  const [isImageRegenerating, setIsImageRegenerating] = useState(false);
  
  // Update internal state if post prop changes from regeneration
  useEffect(() => {
    setEditedText(post.postText);
    setEditedHashtags(post.hashtags);
  }, [post.postText, post.hashtags]);
  
  useEffect(() => {
    if (navigator.share) {
      setIsShareSupported(true);
    }
  }, []);

  const handleCopy = () => {
    const textToCopy = `${editedText}\n\n${editedHashtags}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleShare = async () => {
    if (!navigator.share || !post.image) return;
    
    try {
      const response = await fetch(post.image);
      const blob = await response.blob();
      const file = new File([blob], 'social-spark-ai-image.jpg', { type: blob.type });

      const shareData: ShareData = {
        title: 'AI-Generated Social Media Post',
        text: `${editedText}\n\n${editedHashtags}`,
      };

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        shareData.files = [file];
      }
      await navigator.share(shareData);
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') {
        console.error('Error sharing content:', error);
      }
    }
  };

  const handleSave = () => {
    // In a real app, you might want to save this state more permanently.
    // For now, it just confirms the local edits.
    setIsEditing(false);
  };

  const handleRegenerateTextClick = async () => {
    setIsEditing(false);
    setIsTextRegenerating(true);
    await onRegenerateText();
    setIsTextRegenerating(false);
  };

  const handleRegenerateImageClick = async () => {
    setIsImageRegenerating(true);
    await onRegenerateImage();
    setIsImageRegenerating(false);
  };

  return (
    <div className="group relative bg-[var(--color-bg-secondary)] rounded-2xl overflow-hidden shadow-lg border border-[var(--color-border)] flex flex-col h-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[var(--color-accent-shadow)]">
      <div className="relative w-full aspect-square bg-[var(--color-bg-tertiary)]">
        {post.image && <img src={post.image} alt="Generated visual" className="w-full h-full object-cover" />}
        {(isImageRegenerating || !post.image) && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center transition-opacity">
            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        )}
        {!isImageRegenerating && (
           <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
             <button onClick={handleRegenerateImageClick} className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors">
              <MagicWandIcon className="w-5 h-5"/> Regenerate Image
             </button>
           </div>
        )}
      </div>

      <div className="p-5 flex-grow flex flex-col relative">
        {isTextRegenerating && (
           <div className="absolute inset-0 bg-[var(--color-bg-secondary)]/50 backdrop-blur-sm flex items-center justify-center z-10">
            <svg className="animate-spin h-8 w-8 text-[var(--color-text-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        )}
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-[var(--color-accent)]" />
              <h4 className="font-bold text-lg text-[var(--color-text-primary)]">Generated Post</h4>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleRegenerateTextClick} className="p-1.5 rounded-md hover:bg-[var(--color-bg-tertiary)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" aria-label="Regenerate text"><MagicWandIcon className="w-5 h-5"/></button>
              {isEditing ? (
                  <button onClick={handleSave} className="text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors p-1.5">Save</button>
              ) : (
                  <button onClick={() => setIsEditing(true)} className="p-1.5 rounded-md hover:bg-[var(--color-bg-tertiary)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" aria-label="Edit text"><EditIcon className="w-5 h-5" /></button>
              )}
            </div>
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-4 flex-grow">
            <textarea value={editedText} onChange={(e) => setEditedText(e.target.value)} rows={6} className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-2 focus:ring-1 focus:ring-[var(--color-ring)] text-sm"/>
            <input type="text" value={editedHashtags} onChange={(e) => setEditedHashtags(e.target.value)} className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-2 focus:ring-1 focus:ring-[var(--color-ring)] text-sm font-medium text-[var(--color-accent)]"/>
          </div>
        ) : (
          <div className="flex flex-col gap-4 flex-grow">
            <p className="text-[var(--color-text-secondary)] whitespace-pre-wrap flex-grow">{editedText}</p>
            <p className="text-[var(--color-accent)] font-medium break-words">{editedHashtags}</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-[var(--color-border)] mt-auto bg-transparent">
        <div className="flex items-stretch gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-border)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg-secondary)] focus:ring-[var(--color-ring)]"
          >
            {copied ? <><CheckIcon className="w-5 h-5 text-green-400" />Copied!</> : 'Copy Text'}
          </button>
          {isShareSupported && (
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-border)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg-secondary)] focus:ring-[var(--color-ring)]"
              aria-label="Share post"
            >
              <ShareIcon className="w-5 h-5" />
              <span>Share</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialPostCard;