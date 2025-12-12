# Configuração do Supabase para PitStop Delivery

## 1. Executar Schema SQL

1. Acesse seu projeto no Supabase Dashboard: https://supabase.com/dashboard/project/ckjwgismpnfqjxtgenku
2. Vá em **SQL Editor** no menu lateral
3. Cole o conteúdo do arquivo `supabase-schema.sql` que está na raiz do projeto
4. Clique em **Run**

## 2. Criar Buckets de Storage

1. Vá em **Storage** no menu lateral
2. Clique em **New bucket**
3. Crie os seguintes buckets:

### Bucket: logos
- Nome: `logos`
- Marque **Public bucket**
- Clique em **Create bucket**

### Bucket: products
- Nome: `products`
- Marque **Public bucket**
- Clique em **Create bucket**

### Bucket: covers
- Nome: `covers`
- Marque **Public bucket**
- Clique em **Create bucket**

## 3. Configurar Políticas de Storage

Para cada bucket criado, configure as políticas:

### Para o bucket `logos`:
1. Clique no bucket `logos`
2. Vá na aba **Policies**
3. Clique em **Add policy** > **For full customization**
4. Crie as seguintes políticas:

**Política de SELECT (leitura pública):**
```sql
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
```

**Política de INSERT (upload para usuários autenticados):**
```sql
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');
```

**Política de UPDATE:**
```sql
CREATE POLICY "Users can update own logos" ON storage.objects FOR UPDATE USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Política de DELETE:**
```sql
CREATE POLICY "Users can delete own logos" ON storage.objects FOR DELETE USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

Repita para os buckets `products` e `covers`.

## 4. Configurações de Autenticação

1. Vá em **Authentication** > **Providers**
2. Certifique-se de que **Email** está habilitado
3. Em **Email Templates**, você pode personalizar os emails de confirmação

## 5. Pronto!

Após essas configurações, sua plataforma PitStop Delivery estará pronta para uso!

### Variáveis de Ambiente (já configuradas):
- NEXT_PUBLIC_SUPABASE_URL=https://ckjwgismpnfqjxtgenku.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### Fluxo de Teste:
1. Acesse a aplicação
2. Clique em "Começar Grátis"
3. Crie uma conta
4. Complete o onboarding
5. Acesse o Dashboard
6. Gerencie produtos, pedidos e configurações
7. Compartilhe o link do cardápio com clientes
