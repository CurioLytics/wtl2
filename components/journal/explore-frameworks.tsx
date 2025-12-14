'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus } from 'lucide-react';
import { frameworkService, Framework, FrameworkCategory } from '@/services/journal/framework-service';
import { FrameworkDialog } from '@/components/journal/framework-dialog';

export function ExploreFrameworks() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [categories, setCategories] = useState<FrameworkCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // null = show all
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const refreshFrameworks = async () => {
    try {
      const frameworksData = await frameworkService.getFrameworks();
      setFrameworks(frameworksData);

      // Update selectedFramework if it's currently open
      if (selectedFramework) {
        const updatedFramework = frameworksData.find(
          f => f.name === selectedFramework.name && f.profile_id === selectedFramework.profile_id
        );
        if (updatedFramework) {
          setSelectedFramework(updatedFramework);
        }
      }
    } catch (err) {
      console.error('Error refreshing frameworks:', err);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [frameworksData, categoriesData] = await Promise.all([
          frameworkService.getFrameworks(),
          frameworkService.getCategories()
        ]);

        setFrameworks(frameworksData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching framework data:', err);
        setError('Failed to load frameworks');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredFrameworks = selectedCategory === null
    ? frameworks
    : frameworks.filter(f => f.category === selectedCategory);

  // Sort categories to show Custom first
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.name === 'Custom') return -1;
    if (b.name === 'Custom') return 1;
    return a.name.localeCompare(b.name);
  });

  // Only show create card when no category selected (all) or Custom category selected
  const showCreateCard = selectedCategory === null || selectedCategory === 'Custom';

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
      </div>
    );
  }

  if (frameworks.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Frameworks Available</h3>
        <p className="text-gray-600">
          Frameworks will appear here once they are added to the system.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {sortedCategories.map(category => (
          <button
            key={category.name}
            onClick={() => setSelectedCategory(
              selectedCategory === category.name ? null : category.name
            )}
            className={`
              px-3 py-1.5 text-sm rounded-full transition-colors capitalize
              ${selectedCategory === category.name
                ? 'bg-[var(--primary-blue-lighter)] text-[var(--primary)] font-medium'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Framework Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Create New Card - Only show for Custom category or all categories */}
        {showCreateCard && (
          <div
            onClick={() => setIsCreateDialogOpen(true)}
            className="cursor-pointer transition-all duration-200 group bg-white shadow border-2 border-dashed border-gray-200 hover:border-blue-500 hover:shadow-md rounded-2xl flex flex-col items-center justify-center min-h-[150px]"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
              <Plus className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Tạo Framework Mới</h3>
            <p className="text-xs text-gray-500 mt-1">Tùy chỉnh theo ý bạn</p>
          </div>
        )}

        {filteredFrameworks.map(framework => (
          <Card
            key={framework.name}
            className="cursor-pointer transition-all duration-200 group bg-white shadow border border-gray-200 hover:border-blue-500 hover:shadow-md rounded-2xl"
            onClick={() => {
              setSelectedFramework(framework);
              setIsDialogOpen(true);
            }}
          >
            <CardHeader className="pb-3">
              <div className="text-lg text-gray-800">{framework.name}</div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm line-clamp-2">
                {framework.description && framework.description.length > 100
                  ? `${framework.description.substring(0, 100)}...`
                  : framework.description || 'No description available'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <FrameworkDialog
        framework={selectedFramework}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={refreshFrameworks}
      />

      <FrameworkDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        mode="create"
        framework={null}
        onSave={refreshFrameworks}
      />
    </div>
  );
}