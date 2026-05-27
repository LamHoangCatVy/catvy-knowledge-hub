export default function LoadingScreen({ message = 'Booting Architecture...' }: { message?: string }) {
  return (
    <div style={{
      position: 'fixed', top: 'var(--ifm-navbar-height, 60px)', left: 0, right: 0, bottom: 0,
      zIndex: 100, background: '#030305', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="w-16 h-16 border-2 border-[#bc13fe]/20 border-t-[#00f3ff] rounded-full animate-spin mb-4" />
      <div className="text-xs text-gray-500 font-mono tracking-widest uppercase">{message}</div>
    </div>
  );
}
