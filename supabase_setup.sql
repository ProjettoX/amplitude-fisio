-- Rode isso no SQL Editor do seu projeto Supabase (Supabase Dashboard > SQL Editor > New query)

create table if not exists kv_store (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

-- Habilita Row Level Security (recomendado mesmo em uso pessoal)
alter table kv_store enable row level security;

-- Como é uso pessoal (sem login de pacientes), liberamos acesso via chave anônima.
-- Se no futuro adicionar login de usuários, troque esta policy por regras por usuário.
create policy "Permitir leitura e escrita via anon key"
on kv_store
for all
using (true)
with check (true);
