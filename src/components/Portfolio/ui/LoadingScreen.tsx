export default function LoadingScreen({ message = 'Booting Architecture...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#030305] flex flex-col items-center justify-center transition-opacity duration-500">
      <div className="w-16 h-16 border-2 border-[#bc13fe]/20 border-t-[#00f3ff] rounded-full animate-spin mb-4" />
      <div className="font-mono text-xs text-gray-500 tracking-widest uppercase">{message}</div>
    </div>
  );
}
