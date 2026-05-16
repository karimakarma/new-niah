import { AnimatePresence, motion } from "framer-motion";

type propType = {
  text: string;
  type?: "error" | "success" | "normal";
  closeAction: () => void;
};

export default function Notif({ text, type = "normal", closeAction }: propType) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          className="border-2 fixed top-4 z-50 left-1/2 -translate-x-1/2 w-90 text-center bg-white text-black border-black/70 py-0.5 text-sm font-bold"
          variants={variants}
          initial="hidden"
          animate={type}
          exit="hidden"
          transition={{
            duration: 0.3,
          }}
        >
          <a onClick={() => closeAction()} className="absolute left-2 cursor-pointer">
            x
          </a>
          <p>{text}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const variants = {
  hidden: { opacity: 0, y: "-100%" },
  normal: {
    opacity: 1,
    y: 0,
  },
  success: {
    opacity: 1,
    y: 0,
    borderColor: "var(--color-green-700)",
    backgroundColor: "var(--color-green-600)",
    color: "#fff",
  },
  error: {
    opacity: 1,
    y: 0,
    borderColor: "var(--color-red-800)",
    backgroundColor: "var(--color-red-700)",
    color: "rgba(0, 0, 0, 0.7)",
  },
};
