// src/components/MessageBubble.tsx
import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  theme: 'dark' | 'light';
  showModelAnalysis: boolean;
}

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const renderTokenHighlights = (
    tokensWithScores: { token: string; score: number }[] | undefined,
    theme: 'dark' | 'light'
) => {
    // ... (no change from previous version)
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
        return Math.max(0.15, normalized * 0.75 + 0.25);
    };
     return (
        <div className="flex flex-wrap gap-x-1 gap-y-0.5 leading-snug pt-1">
            {tokensWithScores.map((ts, idx) => (
                <span
                    key={`${ts.token}-${idx}`}
                    style={{
                        backgroundColor: `rgba(16, 163, 127, ${getOpacity(ts.score)})`,
                        padding: '1px 3px',
                        borderRadius: '3px',
                        color: getOpacity(ts.score) > 0.65 ? 'white' : (theme === 'dark' ? '#E0E0E0' : '#111111'),
                        fontSize: '0.75rem',
                    }}
                    title={`Importance: ${typeof ts.score === 'number' ? ts.score.toFixed(4) : 'N/A'}`}
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
    p-2.5 sm:p-3 rounded-xl shadow-md transition-colors duration-300
    w-fit /* Still useful, but max-width will be the primary constraint */
    min-w-[50px]

    /* --- IMPORTANT: Mobile-first max-width and overflow handling --- */
    max-w-[calc(100%-2rem)] /* On very small screens, leave 1rem margin on each side of the MessageList's padding */
    overflow-hidden /* Prevent content from visually spilling out */
    /* --- End mobile-first max-width --- */
    
    sm:max-w-[80%] /* Max width as a percentage for slightly larger small screens */
    
    md:min-w-[80px]
    md:max-w-md /* Fixed max width for medium screens and up */
    
    min-h-[36px] sm:min-h-[40px]
    flex flex-col
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
  const containerClasses = `flex w-full ${isUser ? 'justify-end' : 'justify-start'}`; // Add w-full to container to help constrain bubble
  const textClasses = theme === 'dark' ? 'text-[#ECECF1]' : 'text-[#111111]';
  const secondaryTextClasses = theme === 'dark' ? 'text-[#A1A1AA]' : 'text-[#52525B]';
  const timestampClasses = `text-[0.65rem] sm:text-xs mt-auto pt-1 ${secondaryTextClasses} ${isUser ? 'text-right' : 'text-left'}`;

  const hasBertAnalysisContent = message.analysis && (
    (message.analysis.token_scores && message.analysis.token_scores.length > 0) ||
    message.analysis.details
  );

  let analysisLabel = "Model Analysis";
  if (message.analysis) {
    if (message.analysis.type.startsWith('BERT')) analysisLabel = "BERT Analysis";
  }

  return (
    <div className={containerClasses}> {/* Ensure this container constrains the bubble */}
      <div className={finalBubbleClasses}>
        {/* Inner div for content, applying word-breaking and overflow handling */}
        <div className="flex-grow min-h-0 break-words overflow-wrap-anywhere">
            {message.text && (
            <p className={`whitespace-pre-wrap ${textClasses} text-sm sm:text-base mb-1`}>
                {message.text}
            </p>
            )}

            {message.sender === 'bot' && message.emotions && (
            <div className="mt-1.5 sm:mt-2 space-y-0.5 sm:space-y-1 text-sm sm:text-base">
                {Object.entries(message.emotions)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 7)
                .map(([emotion, probability]) => (
                    <div key={emotion} className="flex justify-between items-center gap-1 sm:gap-2">
                    {/* Make emotion label take less fixed space and allow truncation or wrapping if necessary */}
                    <span className={`${secondaryTextClasses} text-xs sm:text-sm capitalize shrink min-w-0 truncate pr-1`}>{emotion}</span>
                    <div className={`flex-grow h-1.5 sm:h-2 rounded overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}>
                        <div
                            className="h-full bg-[#10A37F]"
                            style={{ width: `${(probability * 100).toFixed(0)}%` }}
                        ></div>
                        </div>
                    <span className={`font-medium w-8 sm:w-10 text-right text-xs sm:text-sm ${textClasses} flex-shrink-0`}>
                        {(probability * 100).toFixed(0)}%
                    </span>
                    </div>
                ))}
            </div>
            )}

            {showModelAnalysis && message.sender === 'bot' && message.analysis && message.analysis.type.startsWith('BERT') && hasBertAnalysisContent && (
            <div className={`mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t text-xs ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                <p className={`font-semibold mb-0.5 sm:mb-1 text-[0.7rem] sm:text-xs ${secondaryTextClasses}`}>{analysisLabel}:</p>

                {message.analysis.token_scores && message.analysis.token_scores.length > 0 && (
                    <div className="mb-0.5 sm:mb-1">
                        <p className={`${secondaryTextClasses} italic text-[0.65rem] sm:text-xs`}>Word Importance:</p>
                        {renderTokenHighlights(message.analysis.token_scores, theme)}
                    </div>
                )}

                {message.analysis.details && (
                <p className={`italic mt-0.5 sm:mt-1 text-[0.65rem] sm:text-xs ${secondaryTextClasses}`}>{message.analysis.details}</p>
                )}
            </div>
            )}

            {message.sender === 'bot' && message.error && (
            <p className={`text-xs sm:text-sm mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{message.error}</p>
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