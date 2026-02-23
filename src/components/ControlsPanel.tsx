'use client';

import { ChatControls } from '@/lib/types';

interface Props {
  controls: ChatControls;
  onChange: (controls: ChatControls) => void;
}

const styles: ChatControls['style'][] = ['Concise', 'Standard', 'DeepDive'];
const formats: ChatControls['format'][] = ['Natural', 'STAR', 'Bullets'];
const tones: ChatControls['tone'][] = ['Calm', 'Confident', 'Energetic'];
const difficulties: ChatControls['difficulty'][] = ['Screening', 'Behavioral', 'Technical', 'BarRaiser'];

export default function ControlsPanel({ controls, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      <SegmentControl
        label="Style"
        options={styles}
        value={controls.style}
        onChange={(v) => onChange({ ...controls, style: v as ChatControls['style'] })}
      />
      <SegmentControl
        label="Format"
        options={formats}
        value={controls.format}
        onChange={(v) => onChange({ ...controls, format: v as ChatControls['format'] })}
      />
      <SegmentControl
        label="Tone"
        options={tones}
        value={controls.tone}
        onChange={(v) => onChange({ ...controls, tone: v as ChatControls['tone'] })}
      />
      <SegmentControl
        label="Difficulty"
        options={difficulties}
        value={controls.difficulty}
        onChange={(v) => onChange({ ...controls, difficulty: v as ChatControls['difficulty'] })}
      />
      <label className="flex items-center gap-1.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={controls.askClarifyingIfNeeded}
          onChange={(e) => onChange({ ...controls, askClarifyingIfNeeded: e.target.checked })}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
        />
        <span className="text-gray-600">Ask follow-up</span>
      </label>
    </div>
  );
}

function SegmentControl({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-500 font-medium">{label}:</span>
      <div className="inline-flex rounded-md border border-gray-200 bg-gray-50 overflow-hidden">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-2 py-1 text-xs transition-colors ${
              value === opt
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {opt === 'DeepDive' ? 'Deep' : opt === 'BarRaiser' ? 'Bar Raiser' : opt}
          </button>
        ))}
      </div>
    </div>
  );
}
