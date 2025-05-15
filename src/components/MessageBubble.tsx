// src/components/MessageBubble.tsx
import React from 'react';
import { Message } from '../types'; 

interface MessageBubbleProps {
  message: Message;
  theme: 'dark' | 'light';
  showModelAnalysis: boolean; // Added prop
}

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const renderTokenHighlights = (
    tokensWithScores: { token: string; score: number }[] | undefined,
    theme: 'dark' | 'light'
) => {
    if (!tokensWithScores || tokensWithScores.length === 0) return null;
    const scores = tokensWithScores.map(ts => ts.score);
    const validScores = scores.filter(s => typeof s === 'number' && !isNaN(s));
    if (validScores.length === 0) return null;
    const minScore = Math.min(...validScores, 0);
    const maxScore = Math.max(...validScores, 0.0001);
    const getOpacity = (score: number) => {
        if (typeof score !== 'number' || isNaN(score)) return 0.2; 
        if (maxScore === minScore) return 0.5;
        const normalized = (score - minScore) / (maxScore - minScore);
        return Math.max(0.1, normalized * 0.8 + 0.2);
    };
     return (
        <div className="flex flex-wrap gap-x-1 gap-y-0.5 leading-snug">
            {tokensWithScores.map((ts, idx) => (
                <span
                    key={`${ts.token}-${idx}`}
                    style={{
                        backgroundColor: `rgba(16, 163, 127, ${getOpacity(ts.score)})`,
                        padding: '1px 3px',
                        borderRadius: '3px',
                        color: getOpacity(ts.score) > 0.6 ? 'white' : (theme === 'dark' ? '#E0E0E0' : '#111111'),
                        fontSize: '0.8rem',
                    }}
                    title={`Importance: ${typeof ts.score === 'number' ? ts.score.toFixed(4) : 'N/A'} (contributing to overall prediction)`}
                >
                    {ts.token.replace(/##/g, '')}
                </span>
            ))}
        </div>
    );
};


const MessageBubble: React.FC<MessageBubbleProps> = ({ message, theme, showModelAnalysis }) => {
  const isUser = message.sender === 'user';

  const commonBubbleStyling = `
    p-3 rounded-lg shadow-md transition-colors duration-300 
    w-fit /* Allows bubble to shrink to content size, respecting min/max widths */
    
    /* --- Responsive Width Control --- */
    /* Default (mobile-first) sizing: applied on all screens unless overridden by a breakpoint */
    min-w-md    /* A small minimum width for very narrow screens or very short content */
    max-w-lg     /* Max width is 90% of parent on small screens, prevents overflow */

    /* sm breakpoint (typically 640px) and up: override for more uniform desktop chatbox appearance */
    md:min-w-[80px]     /* On 'sm' screens and larger, min-width becomes 24rem (384px) as per your snippet */
    md:max-w-md         /* On 'sm' screens and larger, max-width becomes 28rem (448px) as per your snippet */
    /* --- End Responsive Width Control --- */
    
    min-h-[40px]    /* Ensure bubble has some size even if empty initially */
    max-h-[1000px]   /* Max height for the ENTIRE bubble, allows more vertical content */
    flex flex-col   /* Key for layout: content + timestamp at bottom */
    /* overflow-y-auto is handled by the inner content div, not the bubble itself */
  `;
  let senderSpecificClasses = '';
  if (isUser) {
    senderSpecificClasses = theme === 'dark'
      ? 'bg-[#1E2228] text-[#ECECF1] ml-auto'
      : 'bg-[#DCF8C6] text-[#111111] ml-auto';
  } else { 
    senderSpecificClasses = theme === 'dark'
      ? 'bg-[#444654] text-[#ECECF1] border border-[#3E3F4B] mr-auto'
      : 'bg-[#E8E8E8] text-[#111111] border border-[#E5E7EB] mr-auto';
  }
  const finalBubbleClasses = `${commonBubbleStyling} ${senderSpecificClasses}`;
  const containerClasses = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
  const textClasses = theme === 'dark' ? 'text-[#ECECF1]' : 'text-[#111111]';
  const secondaryTextClasses = theme === 'dark' ? 'text-[#A1A1AA]' : 'text-[#52525B]';
  const timestampClasses = `text-xs mt-auto pt-1 ${secondaryTextClasses} ${isUser ? 'text-right' : 'text-left'}`;

  const hasBertAnalysisContent = message.analysis && (
    (message.analysis.token_scores && message.analysis.token_scores.length > 0) ||
    message.analysis.details 
  );

  let analysisLabel = "Model Analysis";
  if (message.analysis) {
    if (message.analysis.type.startsWith('BERT')) {
      analysisLabel = "Model Analysis (BERT)";
    } else if (message.analysis.type.startsWith('Naive Bayes')) {
      analysisLabel = "Model Analysis (Naive Bayes)"; // This won't show if NB analysis is removed from backend
    }
  }

  return (
    <div className={containerClasses}>
      <div className={finalBubbleClasses}>
        <div className="flex-grow min-h-0 overflow-y-auto pr-2"> 
            {message.text && (
            <p className={`whitespace-pre-wrap ${textClasses} mb-1 break-words`}>{message.text}</p>
            )}

            {message.sender === 'bot' && message.emotions && (
            <div className="mt-2 space-y-1 text-base">
                {Object.entries(message.emotions)
                .sort(([, a], [, b]) => b - a)
                .map(([emotion, probability]) => (
                    <div key={emotion} className="flex justify-between items-center gap-2">
                    <span className={`${secondaryTextClasses} text-sm capitalize w-20 truncate`}>{emotion}</span>
                    <div className="flex-grow h-2 bg-gray-600 rounded overflow-hidden">
                        <div
                            className="h-full bg-[#10A37F]"
                            style={{ width: `${(probability * 100).toFixed(0)}%` }}
                        ></div>
                        </div>
                    <span className={`font-medium w-10 text-right text-sm ${textClasses}`}>
                        {(probability * 100).toFixed(0)}%
                    </span>
                    </div>
                ))}
            </div>
            )}

            {/* Conditionally render analysis based on the new prop */}
            {showModelAnalysis && message.sender === 'bot' && message.analysis && message.analysis.type.startsWith('BERT') && hasBertAnalysisContent && (
            <div className={`mt-3 pt-2 border-t text-xs ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
                <p className={` font-semibold mb-1 ${secondaryTextClasses}`}>{analysisLabel}:</p>
                
                {message.analysis.token_scores && message.analysis.token_scores.length > 0 && (
                    <div className="mb-1">
                        <p className={`${secondaryTextClasses} italic text-xs`}>Word importance (BERT attention - last layer avg.):</p>
                        {renderTokenHighlights(message.analysis.token_scores, theme)}
                    </div>
                )}

                {message.analysis.details && (
                <p className={`italic mt-1 ${secondaryTextClasses}`}>{message.analysis.details}</p>
                )}
            </div>
            )}

            {message.sender === 'bot' && message.error && (
            <p className="text-red-400 text-sm mt-1">Error: {message.error}</p>
            )}
        </div> 
        
        <p className={timestampClasses}>
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;