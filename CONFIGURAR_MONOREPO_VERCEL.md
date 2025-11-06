# 🔧 Configurar Monorepo na Vercel (Frontend + Backend no Mesmo Deploy)

## 🐛 Problema

O `vercel.json` está configurado com `builds`, mas apenas o frontend está sendo buildado. O backend não aparece nos logs de build.

**Aviso visto:**
```
WARN! Due to `builds` existing in your configuration file, 
the Build and Development Settings defined in your Project Settings will not apply.
```

## ✅ Solução

### Opção 1: Remover `builds` e Usar Configuração na Interface (RECOMENDADO)

A Vercel recomenda usar a interface ao invés de `builds` no `vercel.json` para monorepos.

#### Passo 1: Remover ou Simplificar vercel.json

O `vercel.json` foi simplificado para apenas rotas:

```json
{
  "version": 2,
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

#### Passo 2: Configurar na Interface da Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto do **frontend** (onde você quer ambos)
3. Vá em **Settings** > **General**
4. Role até **Build & Development Settings**

**IMPORTANTE**: A Vercel no plano Hobby pode não suportar múltiplos builds na mesma interface. Nesse caso, use a **Opção 2**.

### Opção 2: Manter `builds` e Ajustar Configuração (ATUAL)

Se você quer manter o `builds` no `vercel.json`:

#### O vercel.json atual está correto:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

#### O Problema Pode Ser:

1. **A Vercel não está detectando o segundo build**
   - Verifique os logs completos de build
   - Procure por "Building backend" ou "Next.js build"

2. **O backend precisa de variáveis de ambiente**
   - Certifique-se de que `DATABASE_URL` e `JWT_SECRET` estão configuradas

3. **O build do backend está falhando silenciosamente**
   - Verifique os logs completos
   - Procure por erros relacionados ao Next.js

### Opção 3: Usar Projeto Separado (MAIS SIMPLES)

Se o monorepo continuar dando problema:

1. Mantenha o projeto separado do backend que você já criou
2. Atualize `VITE_API_URL` no frontend para apontar para o backend separado
3. Isso é mais confiável e funciona perfeitamente

## 🔍 Verificar se o Backend Está Sendo Buildado

### Nos Logs de Build, Procure Por:

1. **Build do Frontend:**
   ```
   Running "npm run vercel-build"
   > vite build
   ```

2. **Build do Backend (deve aparecer):**
   ```
   Building backend/package.json...
   Running "npm run build"
   > next build
   ```

**Se não aparecer o build do backend, ele não está sendo executado!**

## 📋 Checklist

- [ ] `vercel.json` tem ambos os builds configurados
- [ ] Logs de build mostram build do Next.js
- [ ] Variáveis de ambiente configuradas (DATABASE_URL, JWT_SECRET)
- [ ] Functions aparecem na lista após deploy
- [ ] Rotas `/api/*` retornam JSON (não 404)

## 💡 Recomendação

Para evitar problemas, recomendo manter o **projeto separado do backend** que você já criou. É mais simples, confiável e funciona perfeitamente no plano Hobby.

Se quiser tentar o monorepo, verifique os logs completos de build para ver se o backend está sendo buildado.

