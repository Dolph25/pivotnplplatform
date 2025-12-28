import React from 'react';

interface VerdictBadgeProps {
  verdict: 'buy' | 'consider' | 'pass';
}

export function VerdictBadge({ verdict }: VerdictBadgeProps) {
  const config = {
    buy: {
      text: 'Strong Buy',
      className: 'verdict-badge verdict-buy',
      icon: '✅'
    },
    consider: {
      text: 'Consider',
      className: 'verdict-badge verdict-consider',
      icon: '⚠️'
    },
    pass: {
      text: 'Pass',
      className: 'verdict-badge verdict-pass',
      icon: '❌'
    }
  };

  const { text, className, icon } = config[verdict];

  return (
    <div className={`${className} inline-flex items-center gap-2 animate-fade-in`}>
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}
