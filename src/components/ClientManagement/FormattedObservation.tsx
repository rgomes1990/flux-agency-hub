
import React from 'react';

interface FormattedObservationProps {
  text: string;
  completed?: boolean;
  className?: string;
}

export function FormattedObservation({ 
  text, 
  completed = false, 
  className = "" 
}: FormattedObservationProps) {
  // Preservar quebras de linha e formatação
  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <p 
      className={`text-sm break-words whitespace-pre-wrap ${
        completed ? 'line-through text-gray-500' : 'text-gray-700'
      } ${className}`}
    >
      {formatText(text)}
    </p>
  );
}
