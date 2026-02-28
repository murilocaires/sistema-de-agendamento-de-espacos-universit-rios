# 🎯 Sidebar Dinâmica - SIRU

## 📋 Visão Geral

A sidebar agora é **dinâmica** e pode ser usada por todos os tipos de usuários do sistema. Ela se adapta automaticamente baseada no tipo de perfil que fez login.

## 🔧 Como Funciona

### **1. Componente Sidebar Genérico**

- ✅ **Arquivo:** `src/components/Sidebar.jsx`
- ✅ **Props:** `userType` e `menuItems`
- ✅ **Header dinâmico:** Mostra o tipo de usuário no header

### **2. Layout Dashboard Genérico**

- ✅ **Arquivo:** `src/layouts/DashboardLayout.jsx`
- ✅ **Reutilizável:** Para todos os tipos de usuários
- ✅ **Configurável:** Menu e tipo de usuário dinâmicos

### **3. Configuração de Menus**

- ✅ **Arquivo:** `src/config/userMenus.js`
- ✅ **Menus pré-definidos:** Para cada tipo de usuário
- ✅ **Funções auxiliares:** Para obter menu e tipo de usuário

## 👥 Tipos de Usuários Suportados

### **🔧 ADMIN**

- Home, Reservas, Usuários, Salas

### **👨‍🏫 PROFESSOR**

- Home, Minhas Reservas, Nova Reserva, Histórico

### **👨‍💼 COORDENADOR**

- Home, Reservas, Professores, Relatórios

### **👨‍🎓 ALUNO**

- Home, Reservas, Nova Reserva, Histórico

### **🚪 PORTARIA**

- Home, Reservas, Confirmações, Relatórios

### **🏢 DIREÇÃO**

- Home, Reservas, Usuários, Relatórios, Configurações

## 🚀 Como Usar

### **Exemplo Básico:**

```jsx
import DashboardLayout from "../layouts/DashboardLayout";
import { getUserMenu, getUserTypeDisplay } from "../config/userMenus";

const MinhaPagina = () => {
  const { user } = useAuth();
  const userType = user?.role || "admin";
  const menuItems = getUserMenu(userType);
  const userTypeDisplay = getUserTypeDisplay(userType);

  return (
    <DashboardLayout userType={userTypeDisplay} menuItems={menuItems}>
      <div className="p-8">{/* Seu conteúdo aqui */}</div>
    </DashboardLayout>
  );
};
```

### **Exemplo com Menu Customizado:**

```jsx
const menuCustomizado = [
  { id: "home", label: "Início", icon: LayoutDashboard },
  { id: "custom", label: "Página Custom", icon: Settings },
];

<DashboardLayout userType="CUSTOM" menuItems={menuCustomizado}>
  {/* Conteúdo */}
</DashboardLayout>;
```

## 🎨 Características

### **✅ Header Dinâmico**

- Logo SIRU sempre presente
- Tipo de usuário dinâmico no header
- Cores e estilo consistentes

### **✅ Menu Dinâmico**

- Links específicos para cada tipo de usuário
- Ícones apropriados para cada função
- Estados de hover e active

### **✅ Menu do Usuário**

- Avatar com iniciais dinâmicas
- Nome e email do usuário logado
- Dropdown com Perfil e Sair
- Fecha ao clicar fora

### **✅ Responsividade**

- Largura fixa de 216px
- Altura total da tela
- Dropdown posicionado corretamente

## 🔄 Migração

### **De AdminSidebar para Sidebar:**

1. ✅ Arquivo renomeado: `AdminSidebar.jsx` → `Sidebar.jsx`
2. ✅ Componente renomeado: `AdminSidebar` → `Sidebar`
3. ✅ Props adicionadas: `userType` e `menuItems`
4. ✅ Header dinâmico implementado

### **De AdminLayout para DashboardLayout:**

1. ✅ Layout genérico criado
2. ✅ Props para configuração dinâmica
3. ✅ Reutilizável para todos os usuários

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   └── Sidebar.jsx          # Sidebar genérica
├── layouts/
│   ├── AdminLayout.jsx      # Layout específico admin (legado)
│   └── DashboardLayout.jsx  # Layout genérico (recomendado)
├── config/
│   └── userMenus.js         # Configuração dos menus
└── pages/
    └── dashboard/
        └── Dashboard.jsx     # Exemplo de uso
```

## 🎯 Benefícios

- ✅ **Reutilização:** Uma sidebar para todos os usuários
- ✅ **Manutenibilidade:** Configuração centralizada
- ✅ **Flexibilidade:** Menus customizáveis
- ✅ **Consistência:** Visual uniforme
- ✅ **Escalabilidade:** Fácil adicionar novos tipos de usuário

---

_Sistema de Reservas da Universidade (SIRU) - Sidebar Dinâmica_
