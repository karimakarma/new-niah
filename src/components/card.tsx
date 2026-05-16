type cardType = {
  classNameInner?: string;
  head?: React.ReactNode;
  cont: React.ReactNode;
} & React.ComponentPropsWithoutRef<"div">;

export default function Card({ className, classNameInner, head, cont }: cardType) {
  return (
    <div
      className={`bg-base-950/70 backdrop-blur-lg border border-white/50 rounded-2xl p-5 ${className}`}
    >
      <div className={`h-full flex flex-col justify-between ${classNameInner}`}>
        {head}

        {cont}
      </div>
    </div>
  );
}
