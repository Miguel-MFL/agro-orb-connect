import { supabase } from './supabase';

export interface Machine {
  id: string;
  name: string;
  type: string;
  year: number;
  usage_time: string;
  location: string;
  contact: string;
  images: string[];
  user_id: string;
  created_at: string;
}

export const machinesService = {
  // Buscar todas as máquinas
  async getMachines(): Promise<Machine[]> {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar máquinas:', error);
      throw error;
    }

    return data || [];
  },

  // Buscar máquinas por tipo
  async getMachinesByType(type: string): Promise<Machine[]> {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar máquinas por tipo:', error);
      throw error;
    }

    return data || [];
  },

  // Adicionar nova máquina
  async addMachine(machine: Omit<Machine, 'id' | 'created_at'>): Promise<Machine> {
    const { data, error } = await supabase
      .from('machines')
      .insert([machine])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar máquina:', error);
      throw error;
    }

    return data;
  },

  // Deletar máquina
  async deleteMachine(machineId: string): Promise<void> {
    const { error } = await supabase
      .from('machines')
      .delete()
      .eq('id', machineId);

    if (error) {
      console.error('Erro ao deletar máquina:', error);
      throw error;
    }
  },

  // Buscar máquinas do usuário atual
  async getUserMachines(userId: string): Promise<Machine[]> {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar máquinas do usuário:', error);
      throw error;
    }

    return data || [];
  }
};
