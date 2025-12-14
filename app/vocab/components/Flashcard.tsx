"use client";
export function FlashcardCard({
  front,
  back,
  isFlipped,
  onFlip,
}: {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
}) {
  return (
    <div
      onClick={onFlip}
      // Increased size to w-96 h-64 for bigger flashcard
      className={`w-full max-w-[24rem] h-64 cursor-pointer flex items-center justify-center text-center text-xl font-medium rounded-xl shadow-sm transition-transform ${isFlipped ? "bg-gray-100 rotate-y-180" : "bg-white"
        }`}
    >
      {/* Added p-4 padding for more margin around the text */}
      <div className={`p-6 ${isFlipped ? "transform rotate-y-180" : ""}`}>
        {isFlipped ? back : front}
      </div>
    </div>
  );
}