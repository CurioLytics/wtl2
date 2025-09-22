'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface RoleplayCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export function RoleplayCard({ id, title, description, imageUrl }: RoleplayCardProps) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/roleplay/${id}`);
  };

  return (
    <div 
      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="h-40 bg-gray-300 relative">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={title} 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <span>Image: {title}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        <button className="mt-3 text-sm flex items-center text-blue-600 hover:text-blue-800">
          <span>Start Role-play</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}