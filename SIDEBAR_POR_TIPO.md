# 🎯 Sidebar por Tipo de Usuário - SIRU

## 📋 Como Funciona

A sidebar do SIRU é **dinâmica** e se adapta automaticamente baseada no **tipo de usuário** (role) que fez login. Cada tipo de usuário tem um menu específico com funcionalidades apropriadas para suas responsabilidades.

## 👥 Menus por Tipo de Usuário

### 🔧 **ADMINISTRADOR**

**Header:** "ADMIN"

```
📊 Home
📋 Reservas (Todas)
👥 Usuários (Gerenciar)
🚪 Salas (Gerenciar)
```

**Função:** Controle total do sistema

---

### 👨‍🏫 **DOCENTE**

**Header:** "DOCENTE"

```
📊 Dashboard
📋 Minhas Reservas
📅 Nova Reserva
⏰ Histórico
👤 Meu Perfil
```

**Função:** Gerenciar suas próprias reservas

---

### 👨‍💼 **SERVIDOR**

**Header:** "SERVIDOR"

```
📊 Dashboard
📋 Minhas Reservas
📅 Nova Reserva
⏰ Histórico
👤 Meu Perfil
```

**Função:** Gerenciar suas próprias reservas (funcionalidades administrativas)

---

### 👨‍💼 **COORDENADOR**

**Header:** "COORDENADOR"

```
📊 Home
📋 Reservas (Departamento)
👥 Professores
📈 Relatórios
```

**Função:** Coordenar reservas do departamento

---

### 👨‍🎓 **ALUNO**

**Header:** "ALUNO"

```
📊 Dashboard
📋 Minhas Reservas
📅 Nova Reserva
⏰ Histórico
👤 Meu Perfil
```

**Função:** Reservar espaços para atividades acadêmicas

---

### 🚪 **PORTARIA**

**Header:** "PORTARIA"

```
📊 Home
📋 Reservas (Verificar)
✅ Confirmações
📈 Relatórios
```

**Função:** Confirmar presenças e verificar reservas

---


## 🔄 Como é Determinado

### **1. Login do Usuário**

```javascript
// O usuário faz login com email/senha
const user = await authenticateUser(email, password);
// user.role = "professor", "admin", "aluno", etc.
```

### **2. Determinação do Menu**

```javascript
// O sistema pega o role do usuário
const userType = user.role; // "professor"

// Busca o menu correspondente
const menuItems = getUserMenu(userType); // professorMenu

// Formata o tipo para exibição
const userTypeDisplay = getUserTypeDisplay(userType); // "PROFESSOR"
```

### **3. Renderização da Sidebar**

```javascript
<Sidebar
  userType={userTypeDisplay} // "PROFESSOR"
  menuItems={menuItems} // professorMenu
/>
```

## 🎨 Características Visuais

### **Header Dinâmico**

- ✅ Logo SIRU sempre presente
- ✅ Tipo de usuário em maiúsculo
- ✅ Cores consistentes (gray-100, blue-base)

### **Menu Específico**

- ✅ Links relevantes para cada função
- ✅ Ícones apropriados
- ✅ Estados de hover e active

### **Avatar do Usuário**

- ✅ Iniciais do nome real
- ✅ Email do usuário logado
- ✅ Dropdown com Perfil e Sair

## 🧪 Testando Diferentes Tipos

### **Para testar todos os tipos:**

1. **Admin:** `admin@siru.com` / `admin123`

   - Menu: Home, Reservas, Usuários, Salas

2. **Docente:** (Novo cadastro com role "docente")

   - Menu: Dashboard, Minhas Reservas, Nova Reserva, Histórico, Meu Perfil

3. **Servidor:** (Novo cadastro com role "servidor")

   - Menu: Dashboard, Minhas Reservas, Nova Reserva, Histórico, Meu Perfil

4. **Coordenador:** `maria.santos@universidade.edu` / `coordenador123`

   - Menu: Home, Reservas, Professores, Relatórios

5. **Aluno:** `pedro.costa@aluno.universidade.edu` / `aluno123`

   - Menu: Dashboard, Minhas Reservas, Nova Reserva, Histórico, Meu Perfil

6. **Portaria:** `ana.oliveira@universidade.edu` / `portaria123`

   - Menu: Home, Reservas, Confirmações, Relatórios


## 🔧 Configuração Técnica

### **Arquivo:** `src/config/userMenus.js`

```javascript
// Cada tipo tem seu menu específico
export const professorMenu = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard },
  { id: "minhas-reservas", label: "Minhas Reservas", icon: ClipboardList },
  // ...
];

// Função que determina o menu baseado no tipo
export const getUserMenu = (userType) => {
  switch (userType.toLowerCase()) {
    case "professor":
      return professorMenu;
    case "admin":
      return adminMenu;
    // ...
  }
};
```

### **Componente:** `src/components/Sidebar.jsx`

```javascript
const Sidebar = ({ userType, menuItems }) => {
  return (
    <div className="w-[216px] h-screen bg-gray-100">
      {/* Header com tipo dinâmico */}
      <div className="header">
        <h1>SIRU</h1>
        <p>{userType}</p> {/* "PROFESSOR", "ADMIN", etc. */}
      </div>

      {/* Menu específico do tipo */}
      <nav>
        {menuItems.map((item) => (
          <button key={item.id}>
            <item.icon />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};
```

## ✅ Benefícios

- **🎯 Específico:** Cada tipo vê apenas o que precisa
- **🔒 Seguro:** Usuários não veem funcionalidades desnecessárias
- **🎨 Consistente:** Visual uniforme em todos os tipos
- **🔄 Dinâmico:** Muda automaticamente baseado no login
- **📱 Responsivo:** Funciona em diferentes tamanhos de tela

---

_Sistema de Reservas da Universidade (SIRU) - Sidebar por Tipo de Usuário_
