import { createClient } from '@/services/supabase/client';
import { RoleplayScenario } from '@/types/roleplay';
import { debugLog, errorLog, handleServiceError } from '@/utils/roleplay-utils';

/**
 * Service for fetching and managing roleplay scenarios from database
 */
class RoleplayScenarioService {
  /**
   * Lấy danh sách tình huống roleplay từ Supabase
   */
  async getScenarios(): Promise<RoleplayScenario[]> {
    try {
      const supabase = createClient();

      // Thêm timeout để xử lý lỗi mạng
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const { data, error } = await supabase
        .from('roleplays')
        .select('*');

      clearTimeout(timeoutId);

      if (error) {
        handleServiceError('getScenarios', error, 'Failed to load roleplay scenarios');
      }

      // Biến đổi dữ liệu để đảm bảo tuân thủ RoleplayScenario interface
      const scenarios = data.map(scenario => ({
        id: scenario.id,
        name: scenario.name,
        context: scenario.context,
        starter_message: scenario.starter_message,
        task: scenario.task,
        level: scenario.level,
        topic: scenario.topic,
        ai_role: scenario.ai_role,
        partner_prompt: scenario.partner_prompt ? scenario.partner_prompt.trim() : null,
        image: scenario.image
      }));

      return scenarios;
    } catch (error) {
      handleServiceError('getScenarios', error, 'Failed to load roleplay scenarios');
    }
  }

  /**
   * Lấy chi tiết một tình huống dựa trên ID
   */
  async getScenarioById(id: string): Promise<RoleplayScenario> {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('roleplays')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        handleServiceError('getScenarioById', `Error fetching scenario ${id}: ${error}`, 'Failed to load roleplay scenario');
      }

      if (!data) {
        throw new Error('Scenario not found');
      }

      // Debug: Log the raw data from database
      debugLog('getScenarioById', 'Raw data from database:', data);
      debugLog('getScenarioById', 'Raw data partner_prompt specifically:', {
        partner_prompt: data.partner_prompt,
        partner_prompt_type: typeof data.partner_prompt,
        partner_prompt_length: data.partner_prompt ? data.partner_prompt.length : 'N/A',
        all_keys: Object.keys(data)
      });

      // Biến đổi dữ liệu để đảm bảo tuân thủ RoleplayScenario interface
      const scenario: RoleplayScenario = {
        id: data.id,
        name: data.name,
        context: data.context,
        starter_message: data.starter_message,
        task: data.task,
        level: data.level,
        topic: data.topic,
        ai_role: data.ai_role,
        partner_prompt: data.partner_prompt ? data.partner_prompt.trim() : null,
        image: data.image
      };

      // Debug: Log the processed scenario
      debugLog('getScenarioById', 'Processed scenario:', {
        id: scenario.id,
        name: scenario.name,
        partner_prompt: scenario.partner_prompt,
        partner_prompt_type: typeof scenario.partner_prompt
      });

      return scenario;
    } catch (error) {
      handleServiceError('getScenarioById', error, 'Failed to load roleplay scenario');
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
      handleServiceError('getTopics', error, 'Failed to load roleplay topics');
    }
  }
}



export const roleplayScenarioService = new RoleplayScenarioService();
