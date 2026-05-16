type propType = {
  text: string;
  active?: boolean;
  solid?: boolean;
} & React.ComponentPropsWithoutRef<"button">;

export default function Button({ text, active = false, solid = false, ...props }: propType) {
  return (
    <button
      {...props}
      className={`border px-4 rounded-full font-bold ${active ? (solid ? variants.solid : variants.outline) : variants.inactive} ${props.className}`}
    >
      {text}
    </button>
  );
}

const variants = {
  inactive: "bg-gray text-white/30 bg-gray-400 border-gray-400 cursor-not-allowed",
  solid:
    "bg-white border-white text-base-950 hover:border-white hover:text-white hover:bg-white/0 hover:cursor-pointer",
  outline:
    "border-white text-white bg-white/0 hover:bg-white hover:border-white hover:text-base-950 hover:cursor-pointer",
};
