'use client';

interface Props {
  questions: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export default function SuggestedQuestions({ questions, onSelect, disabled }: Props) {
  if (!questions.length) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Suggested practice questions:</h3>
      <div className="grid gap-2">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            disabled={disabled}
            className="text-left text-sm px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span className="text-primary-600 font-medium mr-2 group-hover:text-primary-700">
              Q{i + 1}.
            </span>
            <span className="text-gray-700 group-hover:text-gray-900">{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
