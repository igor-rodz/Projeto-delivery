# Configuração do Supabase para PitStop Delivery

## ⚠️ IMPORTANTE: Execute estes passos na ordem correta!

---

## Passo 1: Executar Schema SQL

1. Acesse seu projeto no Supabase Dashboard: 
   https://supabase.com/dashboard/project/ckjwgismpnfqjxtgenku

2. Vá em **SQL Editor** no menu lateral

3. Copie TODO o conteúdo do arquivo `supabase-schema.sql` que está na raiz do projeto

4. Cole no editor SQL

5. Clique em **Run** (ou pressione Ctrl+Enter)

6. Você deve ver "Success" para todas as operações

---

## Passo 2: Criar Buckets de Storage

1. Vá em **Storage** no menu lateral

2. Clique em **New bucket** e crie os seguintes buckets:

### Bucket 1: logos
- Name: `logos`
- ✅ Marque **Public bucket**
- Clique em **Create bucket**

### Bucket 2: products  
- Name: `products`
- ✅ Marque **Public bucket**
- Clique em **Create bucket**

### Bucket 3: covers
- Name: `covers`
- ✅ Marque **Public bucket**
- Clique em **Create bucket**

---

## Passo 3: Configurar Políticas de Storage

Para cada bucket, você precisa criar políticas de acesso:

1. Clique no bucket (ex: `logos`)
2. Vá na aba **Policies**
3. Clique em **New Policy**
4. Selecione **For full customization**
5. Adicione as seguintes políticas:

### Para TODOS os buckets, crie estas 4 políticas:

**1. SELECT (leitura pública):**
- Policy name: `Public Read Access`
- Allowed operation: SELECT
- Target roles: (deixe vazio para todos)
- USING expression:
```sql
true
```

**2. INSERT (upload):**
- Policy name: `Authenticated Upload`
- Allowed operation: INSERT  
- Target roles: `authenticated`
- WITH CHECK expression:
```sql
true
```

**3. UPDATE:**
- Policy name: `Authenticated Update`
- Allowed operation: UPDATE
- Target roles: `authenticated`
- USING expression:
```sql
true
```

**4. DELETE:**
- Policy name: `Authenticated Delete`
- Allowed operation: DELETE
- Target roles: `authenticated`
- USING expression:
```sql
true
```

**Repita para os 3 buckets:** `logos`, `products`, `covers`

---

## Passo 4: Verificar Autenticação

1. Vá em **Authentication** > **Providers**
2. Certifique-se de que **Email** está habilitado
3. Em **Authentication** > **URL Configuration**, verifique:
   - Site URL: sua URL de produção ou `http://localhost:3000`
   - Redirect URLs: adicione suas URLs permitidas

---

## Passo 5: Testar a Aplicação

1. Acesse a aplicação: http://localhost:3000
2. Clique em "Começar Grátis" ou "Entrar"
3. Crie uma nova conta com email e senha
4. Complete o onboarding (nome do negócio, endereço, etc.)
5. Você será redirecionado para o Dashboard
6. Teste as funcionalidades:
   - Adicionar/editar produtos
   - Configurar áreas de entrega
   - Personalizar configurações
   - Ver cardápio público em `/menu/[seu-slug]`

---

## Variáveis de Ambiente (já configuradas)

```env
NEXT_PUBLIC_SUPABASE_URL=https://ckjwgismpnfqjxtgenku.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Solução de Problemas

### Erro: "new row violates row-level security policy"
- Execute novamente o schema SQL completo
- Certifique-se de que todas as políticas foram criadas corretamente

### Erro: "Storage upload failed"
- Verifique se os buckets foram criados como "Public"
- Verifique se as políticas de storage foram configuradas

### Erro: "User not authenticated"
- Faça logout e login novamente
- Limpe os cookies do navegador e tente novamente

---

## Arquitetura do Banco de Dados

```
businesses (1)
  └── categories (N)
       └── products (N)
  └── additionals (N)
  └── delivery_areas (N)
  └── orders (N)
       └── order_items (N)
```

Pronto! Sua plataforma PitStop Delivery está configurada! 🚀
