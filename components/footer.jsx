export default function Footer() {
  return (
    <footer className="mt-10 py-6 text-center text-sm text-white/50">
      © <span suppressHydrationWarning>{new Date().getFullYear()}</span> DFamily · no cap, we got this
    </footer>
  );
}
