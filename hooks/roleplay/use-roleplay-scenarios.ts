import { useAuth } from '@/hooks/auth/use-auth';
import useCachedFetch from '@/hooks/common/use-cached-fetch';
import { RoleplayScenario } from '@/types/roleplay';
import { roleplayScenarioService } from '@/services/roleplay/roleplay-scenario-service';

/**
 * Hook to fetch roleplay scenarios with caching
 * @param topic Optional filter by topic
 * @param difficulty Optional filter by difficulty level
 */
export function useRoleplayScenarios(topic?: string, difficulty?: string) {
  const { user } = useAuth();

  const {
    data: scenarios,
    loading,
    error,
    refresh
  } = useCachedFetch<RoleplayScenario[]>({
    key: `roleplay-scenarios-${topic || 'all'}-${difficulty || 'all'}`,
    duration: 5 * 60 * 1000, // 5 minutes cache
    dependencyArray: [user?.id, topic, difficulty],
    fetcher: async () => {
      const allScenarios = await roleplayScenarioService.getScenarios();

      let filtered = allScenarios;

      if (topic) {
        filtered = filtered.filter(scenario => scenario.topic === topic);
      }

      if (difficulty) {
        filtered = filtered.filter(scenario => scenario.level === difficulty);
      }

      return filtered;
    },
    fallback: []
  });

  return {
    scenarios,
    loading,
    error,
    refresh
  };
}
