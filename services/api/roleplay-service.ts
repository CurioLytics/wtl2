'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { RoleplayScenario } from '@/types/roleplay';
import { useAuth } from '@/hooks/auth/use-auth';
import useCachedFetch from '@/hooks/common/use-cached-fetch';

/**
 * Service xử lý các API liên quan đến tính năng Role-play
 */
class RoleplayService {
  /**
   * Lấy danh sách tình huống roleplay từ Supabase
   */
  async getScenarios(): Promise<RoleplayScenario[]> {
    try {
      const supabase = createClientComponentClient();
      
      // Thêm timeout để xử lý lỗi mạng
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const { data, error } = await supabase
        .from('roleplay_scenario')
        .select('*');
        
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('Error fetching roleplay scenarios:', error);
        throw new Error('Failed to load roleplay scenarios');
      }
      
      // Biến đổi dữ liệu để đảm bảo tuân thủ RoleplayScenario interface
      const scenarios = data.map(scenario => ({
        id: scenario.id,
        name: scenario.name || 'Unnamed Scenario',
        context: scenario.context || '',
        starter_message: scenario.starter_message || '',
        guide: scenario.guide || '',
        level: scenario.level || 'Beginner',
        topic: scenario.topic || 'General',
        role1: scenario.role1 || 'Conversation Partner'
      }));
      
      return scenarios;
    } catch (error) {
      console.error('Error in getScenarios:', error);
      throw error;
    }
  }
  
  /**
   * Lấy chi tiết một tình huống dựa trên ID
   */
  async getScenarioById(id: string): Promise<RoleplayScenario> {
    try {
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from('roleplay_scenario')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error(`Error fetching roleplay scenario with id ${id}:`, error);
        throw new Error('Failed to load roleplay scenario');
      }
      
      if (!data) {
        throw new Error('Scenario not found');
      }
      
      // Biến đổi dữ liệu để đảm bảo tuân thủ RoleplayScenario interface
      const scenario: RoleplayScenario = {
        id: data.id,
        name: data.name || 'Unnamed Scenario',
        context: data.context || '',
        starter_message: data.starter_message || '',
        guide: data.guide || '',
        level: data.level || 'Beginner',
        topic: data.topic || 'General',
        role1: data.role1 || 'Conversation Partner'
      };
      
      return scenario;
    } catch (error) {
      console.error(`Error in getScenarioById:`, error);
      throw error;
    }
  }
  
  /**
   * Lấy danh sách tất cả các chủ đề có sẵn
   */
  async getTopics(): Promise<string[]> {
    try {
      const scenarios = await this.getScenarios();
      
      // Lấy danh sách topics duy nhất
      const topics = [...new Set(scenarios.map(scenario => scenario.topic))];
      
      return topics;
    } catch (error) {
      console.error('Error getting topics:', error);
      throw error;
    }
  }
}

export const roleplayService = new RoleplayService();

/**
 * Hook để sử dụng danh sách tình huống roleplay với cache
 * @param topic Filter theo chủ đề (không bắt buộc)
 */
export function useRoleplayScenarios(topic?: string) {
  const { user } = useAuth();
  
  const { 
    data: scenarios, 
    loading, 
    error,
    refresh
  } = useCachedFetch<RoleplayScenario[]>({
    key: `roleplay-scenarios-${topic || 'all'}`,
    duration: 5 * 60 * 1000, // 5 minutes cache
    dependencyArray: [user?.id, topic],
    fetcher: async () => {
      const allScenarios = await roleplayService.getScenarios();
      
      // Nếu có topic, lọc kết quả
      if (topic) {
        return allScenarios.filter(scenario => scenario.topic === topic);
      }
      
      return allScenarios;
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

/**
 * Hook để lấy danh sách tất cả các chủ đề với cache
 */
export function useRoleplayTopics() {
  const { user } = useAuth();
  
  const {
    data: topics,
    loading,
    error
  } = useCachedFetch<string[]>({
    key: 'roleplay-topics',
    duration: 10 * 60 * 1000, // 10 minutes cache
    dependencyArray: [user?.id],
    fetcher: async () => {
      return await roleplayService.getTopics();
    },
    fallback: []
  });
  
  return {
    topics,
    loading,
    error
  };
}