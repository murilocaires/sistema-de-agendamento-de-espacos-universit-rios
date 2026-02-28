# 🔍 Diagnosticar Por Que o Backend Não Está Sendo Buildado

## 🐛 Problema

O `vercel.json` está configurado com ambos os builds, mas apenas o frontend aparece nos logs.

## 🔍 Diagnóstico Passo a Passo

### 1. Verificar Logs Completos de Build

Nos logs de build da Vercel, procure por:

**✅ Se o backend está sendo buildado, você verá:**
```
Building backend/package.json...
Installing dependencies...
Running "npm run build"
> next build
```

**❌ Se não aparecer isso, o backend não está sendo buildado.**

### 2. Verificar se o Aviso Aparece

Se você vê este aviso:
```
WARN! Due to `builds` existing in your configuration file, 
the Build and Development Settings defined in your Project Settings will not apply.
```

Isso significa que a Vercel está usando o `vercel.json` e ignorando as configurações da interface.

### 3. Possíveis Causas

#### Causa 1: Vercel não detecta o segundo build
- **Solução**: A ordem dos builds foi invertida (backend primeiro)
- **Status**: ✅ Já aplicado

#### Causa 2: Backend precisa de variáveis de ambiente
- **Verificar**: `DATABASE_URL` e `JWT_SECRET` estão configuradas?
- **Solução**: Configure na Vercel > Settings > Environment Variables

#### Causa 3: Build do backend está falhando silenciosamente
- **Verificar**: Veja os logs completos (role até o final)
- **Solução**: Procure por erros relacionados ao Next.js

#### Causa 4: Vercel não suporta múltiplos builds no plano Hobby
- **Verificar**: Você está no plano Hobby?
- **Solução**: Pode ser necessário usar projeto separado ou upgrade

## ✅ Solução Aplicada

O `vercel.json` foi ajustado para buildar o backend primeiro:

```json
{
  "builds": [
    {
      "src": "backend/package.json",  // ← Backend primeiro
      "use": "@vercel/next"
    },
    {
      "src": "package.json",          // ← Frontend depois
      "use": "@vercel/static-build"
    }
  ]
}
```

## 📋 Próximos Passos

### Passo 1: Fazer Commit e Push

```bash
git add vercel.json
git commit -m "Ajustar ordem de builds - backend primeiro"
git push origin main
```

### Passo 2: Verificar Variáveis de Ambiente

No projeto na Vercel:
- Settings > Environment Variables
- Certifique-se de ter: `DATABASE_URL`, `JWT_SECRET`

### Passo 3: Fazer Novo Deploy

Após o commit, a Vercel fará deploy automático.

### Passo 4: Verificar Logs Completos

1. Vá em **Deployments**
2. Clique no último deployment
3. Veja os logs **completos** (role até o final)
4. Procure por:
   - `Building backend/package.json...`
   - `next build`
   - Erros relacionados ao backend

## 🔧 Se Ainda Não Funcionar

### Opção A: Verificar se o backend/package.json existe

```bash
# Localmente, verifique:
ls backend/package.json
cat backend/package.json | grep "build"
```

Deve ter:
```json
{
  "scripts": {
    "build": "next build"
  }
}
```

### Opção B: Testar Build Localmente

```bash
cd backend
npm install
npm run build
```

Se funcionar localmente, o problema é na Vercel.

### Opção C: Adicionar Build Command Explícito

Tente adicionar no `vercel.json`:

```json
{
  "builds": [
    {
      "src": "backend/package.json",
      "use": "@vercel/next",
      "config": {
        "buildCommand": "cd backend && npm install && npm run build"
      }
    }
  ]
}
```

## 📝 Checklist de Diagnóstico

- [ ] `vercel.json` tem backend primeiro nos builds
- [ ] Commit e push feitos
- [ ] Variáveis de ambiente configuradas
- [ ] Logs completos verificados
- [ ] Build do backend aparece nos logs?
- [ ] Functions aparecem após deploy?
- [ ] `/api/init` retorna JSON?

## 💡 Dica

Se após todas as tentativas o backend ainda não aparecer nos logs, pode ser uma limitação do plano Hobby da Vercel com múltiplos builds. Nesse caso, a melhor solução é manter projetos separados.

