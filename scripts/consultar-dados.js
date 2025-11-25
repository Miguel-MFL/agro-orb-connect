import { createClient } from '@supabase/supabase-js';

// Credenciais do Lovable Cloud (do arquivo .env)
const supabaseUrl = 'https://cqadwyhkxqtvqfsnmqka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxYWR3eWhreHF0dnFmc25tcWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTk3NjAsImV4cCI6MjA3NzU3NTc2MH0.mze5uw2mVdwsT7YURLdiAIhWtwKwnR8u2uBWDGFeiQg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function consultarDados() {
  console.log('🔍 Consultando dados do banco...\n');

  // Buscar usuários (profiles)
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');

  if (profilesError) {
    console.error('❌ Erro ao buscar usuários:', profilesError.message);
  } else {
    console.log('👥 USUÁRIOS CADASTRADOS:');
    console.log('========================');
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.full_name || 'Sem nome'}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   ID: ${profile.id}`);
      console.log(`   Cadastrado em: ${new Date(profile.created_at).toLocaleString('pt-BR')}`);
      console.log('');
    });
    console.log(`Total: ${profiles.length} usuário(s)\n`);
  }

  // Buscar máquinas
  const { data: machines, error: machinesError } = await supabase
    .from('machines')
    .select('*');

  if (machinesError) {
    console.error('❌ Erro ao buscar máquinas:', machinesError.message);
  } else {
    console.log('🚜 MÁQUINAS CADASTRADAS:');
    console.log('========================');
    machines.forEach((machine, index) => {
      console.log(`${index + 1}. ${machine.name}`);
      console.log(`   Tipo: ${machine.type}`);
      console.log(`   Ano: ${machine.year}`);
      console.log(`   Localização: ${machine.location}`);
      console.log(`   Contato: ${machine.contact}`);
      console.log(`   Tempo de uso: ${machine.usage_time}`);
      if (machine.hourly_price) {
        console.log(`   Preço/hora: R$ ${machine.hourly_price}`);
      }
      console.log(`   Cadastrada em: ${new Date(machine.created_at).toLocaleString('pt-BR')}`);
      console.log('');
    });
    console.log(`Total: ${machines.length} máquina(s)\n`);
  }
}

consultarDados();
