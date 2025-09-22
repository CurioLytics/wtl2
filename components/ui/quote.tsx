// Remove the 'use client' directive since quotes should be consistent
// between server and client rendering

interface QuoteProps {
  text: string;
  author: string;
}

export function Quote({ text, author }: QuoteProps) {
  // Ensure the text is the same on server and client
  // by trimming and normalizing it
  const normalizedText = text.trim();
  const normalizedAuthor = author.trim();
  
  return (
    <div className="bg-gray-100 rounded-lg p-6 text-center">
      <p className="text-lg text-gray-800 italic" data-testid="quote-text">"{normalizedText}"</p>
      <p className="text-sm text-gray-600 mt-2" data-testid="quote-author">— {normalizedAuthor}</p>
    </div>
  );
}