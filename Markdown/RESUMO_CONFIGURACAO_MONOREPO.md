# 📋 Resumo: Configuração Completa do Monorepo na Vercel

## ✅ O que foi configurado

### 1. `vercel.json` (Ajustado)
- ✅ Removido `buildCommand` do topo (não necessário com `builds`)
- ✅ Configurado `builds` para Next.js e Vite separadamente
- ✅ Adicionado `rewrites` para mapear `/api/*` corretamente
- ✅ Mantido `routes` para servir arquivos estáticos

### 2. `package.json` (Ajustado)
- ✅ Adicionado scripts `build:frontend` e `build:backend`
- ✅ Removido `vercel-build` (não necessário, o `vercel.json` gerencia)

### 3. Documentação Criada
- ✅ `CONFIGURACAO_DASHBOARD_VERCEL.md` - Guia completo da dashboard
- ✅ `VARIAVEIS_AMBIENTE_VERCEL.md` - Variáveis de ambiente
- ✅ `CONFIGURACAO_MONOREPO_VERCEL.md` - Configuração geral

## 🔧 Configurações na Dashboard da Vercel

### Settings > General
- **Root Directory**: Vazio ou `./` (raiz do repositório)
- **Framework Preset**: `Other` ou vazio

### Settings > Build and Output Settings
- **Install Command**: 
  ```bash
  npm install --prefix backend && npm install
  ```
- **Build Command**: **Vazio** (deixar `vercel.json` gerenciar)
- **Output Directory**: `dist`

### Settings > Environment Variables
Configure estas 3 variáveis:
1. `DATABASE_URL` - String de conexão PostgreSQL
2. `JWT_SECRET` - Chave secreta para JWT
3. `VITE_API_URL` - URL da API (atualizar após primeiro deploy)

## 📁 Estrutura Final

```
sistema-de-agendamento-de-espacos-universit-rios/
├── vercel.json              # ✅ Configurado para monorepo
├── package.json             # ✅ Scripts de build adicionados
├── src/                     # Frontend (Vite/React)
├── backend/                 # Backend (Next.js)
│   ├── pages/api/          # Serverless Functions
│   └── package.json
└── dist/                    # Output do frontend (gerado)
```

## 🚀 Próximos Passos

### 1. Configurar Dashboard da Vercel
Siga o guia em `CONFIGURACAO_DASHBOARD_VERCEL.md`:
- Configure Root Directory como vazio
- Configure Install Command
- Deixe Build Command vazio
- Configure Output Directory como `dist`
- Adicione as 3 variáveis de ambiente

### 2. Fazer Deploy
```bash
git add .
git commit -m "Configurar monorepo para Vercel"
git push
```

### 3. Verificar Deploy
Após o deploy:
1. Vá em **Functions** na dashboard
2. Deve aparecer lista de funções: `/api/auth/login`, `/api/init`, etc.
3. Teste: `https://seu-projeto.vercel.app/api/init`

### 4. Atualizar VITE_API_URL
Após descobrir a URL do projeto:
1. Vá em **Settings** > **Environment Variables**
2. Edite `VITE_API_URL` com a URL real: `https://sua-url.vercel.app/api`
3. Faça redeploy

### 5. Inicializar Banco de Dados
```bash
curl -X POST https://seu-projeto.vercel.app/api/init
```

## 🔍 Como Funciona

### Durante o Build:

1. **Install Command** instala dependências:
   - `npm install --prefix backend` → Instala dependências do backend
   - `npm install` → Instala dependências do frontend

2. **Vercel lê `vercel.json`** e executa `builds`:
   - **Backend**: `@vercel/next` builda `backend/package.json`
     - Cria Serverless Functions de `backend/pages/api/*`
     - Rotas `/api/*` ficam disponíveis automaticamente
   - **Frontend**: `@vercel/static-build` builda `package.json` (raiz)
     - Compila Vite/React para `dist/`
     - Serve arquivos estáticos

3. **Rotas são aplicadas**:
   - `/api/*` → Serverless Functions (Next.js)
   - `/*` → Arquivos estáticos (Vite/React)

## ⚠️ Pontos Críticos

1. **Root Directory**: Deve estar vazio (raiz), NÃO `backend/`
2. **Build Command**: Deve estar vazio (deixar `vercel.json` gerenciar)
3. **Install Command**: Deve instalar dependências de ambos os projetos
4. **VITE_API_URL**: Atualizar após primeiro deploy com URL real

## 🐛 Troubleshooting

### 404 nas rotas `/api/*`
- Verifique se Root Directory está vazio (não `backend/`)
- Verifique se as Functions aparecem na lista de Functions
- Verifique os logs de build

### Frontend não aparece
- Verifique se Output Directory está como `dist`
- Verifique se o build do frontend foi bem-sucedido

### Erro de dependências
- Verifique se Install Command está correto
- Verifique se `node_modules` foram criados em ambos os projetos

## 📚 Documentação de Referência

- `CONFIGURACAO_DASHBOARD_VERCEL.md` - Configurações da dashboard
- `VARIAVEIS_AMBIENTE_VERCEL.md` - Variáveis de ambiente
- `CONFIGURACAO_MONOREPO_VERCEL.md` - Configuração geral

---

**Tudo configurado!** Agora é só configurar a dashboard da Vercel e fazer deploy! 🚀

