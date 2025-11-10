import { supabase } from './supabase';

export const storageService = {
  async uploadMachineImage(file: File, machineId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${machineId}.${fileExt}`;

    const { error } = await supabase.storage
      .from('machine-images')
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from('machine-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
};
