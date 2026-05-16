type textPropTypes = {
  long?: boolean;
};

export function TextField({
  long = false,
  className,
  ...props
}: textPropTypes &
  React.ComponentPropsWithoutRef<"textarea"> &
  React.ComponentPropsWithoutRef<"input">) {
  const baseClass = `bg-base-900/80 border border-white/30 rounded-xl focus:border-white focus:bg-base-900 outline-0 p-2 w-full flex ${className}`;

  return long ? (
    <textarea rows={6} className={`${baseClass} ${className}`} {...props} />
  ) : (
    <input type="text" className={`${baseClass} ${className}`} {...props} />
  );
}

type ddPropTypes = {
  options: string[];
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
};
export function Dropdown({ options, value, onChange, className }: ddPropTypes) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`bg-white/10 border border-white/30 rounded-xl outline-0 p-2 text-white ${className ?? ""}`}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
