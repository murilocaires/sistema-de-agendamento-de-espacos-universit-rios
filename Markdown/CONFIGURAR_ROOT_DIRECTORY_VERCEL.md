# 🔧 Configurar Root Directory na Vercel Dashboard

## ⚠️ Problema: 404 nas Rotas da API

Se você está recebendo erro 404 nas chamadas para `/api/*`, o problema mais provável é que a Vercel não está reconhecendo corretamente o diretório do backend.

## ✅ Solução: Configurar Root Directory na Dashboard

### Passo 1: Acessar Configurações do Projeto

1. Acesse https://vercel.com
2. Entre no seu projeto
3. Vá em **Settings** > **General**

### Passo 2: Configurar Root Directory

Na seção **Root Directory**:

**Opção A - Se você quer deployar o monorepo completo:**
- Deixe **Root Directory** vazio (raiz do repositório)
- A Vercel usará o `vercel.json` para configurar os builds

**Opção B - Se você quer deployar apenas o backend primeiro (para testar):**
- Configure **Root Directory** como: `backend`
- Isso fará a Vercel tratar a pasta `backend/` como raiz do projeto
- ⚠️ **Nota**: Isso só funciona se você quiser deployar apenas o backend. Para monorepo, use a Opção A.

### Passo 3: Verificar Framework Preset

Na seção **Framework Preset**:
- Deve estar como **Next.js** (ou **Other** se você estiver usando o `vercel.json`)

### Passo 4: Verificar Build Command

Na seção **Build and Output Settings**:
- **Build Command**: Deve estar vazio (o `vercel.json` cuida disso) OU `npm run vercel-build`
- **Output Directory**: Deve estar vazio (o `vercel.json` cuida disso)

### Passo 5: Verificar Install Command

- **Install Command**: `npm install` (padrão)

## 🎯 Configuração Recomendada para Monorepo

Para um monorepo funcionando corretamente:

### Na Dashboard da Vercel:

1. **Root Directory**: Deixe vazio (raiz do repositório)
2. **Framework Preset**: Other (ou Next.js - a Vercel pode detectar automaticamente)
3. **Build Command**: Deixe vazio (o `vercel.json` define `buildCommand`)
4. **Output Directory**: Deixe vazio
5. **Install Command**: `npm install` (padrão)

### No `vercel.json` (já configurado):

```json
{
  "version": 2,
  "buildCommand": "npm run vercel-build",
  "builds": [
    {
      "src": "backend/package.json",
      "use": "@vercel/next",
      "config": {
        "zeroConfig": false,
        "rootDirectory": "backend"
      }
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

## 🔍 Verificar se Está Funcionando

Após configurar:

1. **Fazer Redeploy**:
   - Vá em **Deployments**
   - Clique nos três pontos (⋯) do último deployment
   - Selecione **Redeploy**

2. **Verificar Functions**:
   - Vá em **Functions**
   - Deve aparecer uma lista de funções:
     - `/api/auth/login`
     - `/api/auth/verify`
     - `/api/init`
     - etc.

3. **Testar API**:
   - Acesse: `https://seu-projeto.vercel.app/api/init`
   - Deve retornar JSON (não HTML 404)

## 🐛 Se Ainda Não Funcionar

### Alternativa: Usar Projetos Separados

Se o monorepo continuar dando problemas, você pode usar **2 projetos separados** na Vercel:

1. **Projeto Frontend**:
   - Root Directory: vazio (raiz)
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Projeto Backend**:
   - Root Directory: `backend`
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Configurar `VITE_API_URL` no frontend**:
   - Apontar para a URL do projeto backend
   - Exemplo: `https://seu-backend.vercel.app/api`

## 📝 Checklist

- [ ] Root Directory configurado corretamente na dashboard
- [ ] Build Command vazio ou usando `npm run vercel-build`
- [ ] `vercel.json` configurado com `rootDirectory: "backend"` no build do Next.js
- [ ] Redeploy feito após alterações
- [ ] Functions aparecem na lista de Functions
- [ ] Teste de `/api/init` retorna JSON (não 404)

---

**Importante**: A configuração do Root Directory na dashboard da Vercel é crucial para monorepos. Se não estiver configurado corretamente, a Vercel pode não encontrar o código do backend.

