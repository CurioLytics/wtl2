'use client';

interface CountdownOverlayProps {
  countdown: number | null;
}

export function CountdownOverlay({ countdown }: CountdownOverlayProps) {
  if (countdown === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="text-9xl font-bold text-white animate-bounce">
        {countdown > 0 ? countdown : 'GO!'}
      </div>
    </div>
  );
}
