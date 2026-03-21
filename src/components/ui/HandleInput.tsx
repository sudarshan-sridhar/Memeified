"use client";

interface HandleInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function HandleInput({
  value,
  onChange,
  disabled,
}: HandleInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/^@/, ""))}
      placeholder="@username"
      disabled={disabled}
      className="handle-input pl-5 disabled:opacity-50 disabled:cursor-not-allowed"
    />
  );
}
