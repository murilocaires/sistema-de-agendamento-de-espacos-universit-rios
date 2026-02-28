# 🔧 Corrigir URL da API na Vercel

## 🐛 Problema

O site na Vercel está tentando se conectar ao backend usando `http://localhost:3001/api` ao invés da URL de produção.

**Causa**: A variável de ambiente `VITE_API_URL` não está configurada na Vercel.

## ✅ Solução

### Passo 1: Descobrir a URL do seu projeto na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Entre no seu projeto
3. Vá em **Settings** > **Domains** ou veja a URL na página inicial
4. A URL será algo como: `https://seu-projeto.vercel.app`

### Passo 2: Configurar a variável de ambiente na Vercel

1. Na dashboard da Vercel, vá em **Settings** > **Environment Variables**
2. Adicione a seguinte variável:

   **Nome da variável:**
   ```
   VITE_API_URL
   ```

   **Valor:**
   ```
   https://seu-projeto.vercel.app/api
   ```
   
   ⚠️ **IMPORTANTE**: Substitua `seu-projeto.vercel.app` pela URL real do seu projeto!

   **Ambientes:** Selecione:
   - ✅ Production
   - ✅ Preview
   - ✅ Development (opcional)

3. Clique em **Save**

### Passo 3: Fazer um novo deploy

Após adicionar a variável de ambiente, você precisa fazer um novo deploy:

**Opção A - Deploy automático:**
- Faça um pequeno commit e push para o GitHub
- A Vercel fará deploy automático

**Opção B - Redeploy manual:**
1. Na dashboard da Vercel, vá em **Deployments**
2. Clique nos três pontos (⋯) do último deployment
3. Selecione **Redeploy**
4. Aguarde o processo concluir

## 🔍 Verificar se funcionou

Após o deploy:

1. Acesse seu site na Vercel
2. Abra o **Console do navegador** (F12 > Console)
3. Procure por erros de conexão
4. Verifique se as requisições estão indo para `https://seu-projeto.vercel.app/api` e não para `localhost`

## 📝 Variáveis de ambiente necessárias na Vercel

Certifique-se de ter todas estas variáveis configuradas:

```
VITE_API_URL=https://seu-projeto.vercel.app/api
DATABASE_URL=postgresql://usuario:senha@host:porta/database?sslmode=require
JWT_SECRET=seu-jwt-secret-super-seguro-para-producao
NODE_ENV=production
```

## 🎯 Exemplo prático

Se sua URL na Vercel é `https://sistema-reservas.vercel.app`, configure:

```
VITE_API_URL=https://sistema-reservas.vercel.app/api
```

## ⚠️ Importante

- A variável `VITE_API_URL` **deve** começar com `https://` (não `http://`)
- A URL deve terminar com `/api` (não apenas a URL base)
- Após adicionar a variável, **sempre** faça um novo deploy para que ela seja aplicada

## 🐛 Se ainda não funcionar

1. Verifique se a variável está configurada corretamente (sem espaços extras)
2. Confirme que fez um novo deploy após adicionar a variável
3. Verifique os logs de build na Vercel para ver se há erros
4. Teste acessando diretamente: `https://seu-projeto.vercel.app/api/auth/verify` (deve retornar um JSON)

