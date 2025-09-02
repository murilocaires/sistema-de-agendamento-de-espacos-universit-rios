# 📝 Cadastro com Tipos de Usuário - SIRU

## 🎯 Funcionalidade Implementada

O formulário de cadastro agora inclui um **dropdown** para selecionar o tipo de usuário entre **Docente** e **Servidor**.

## 🔧 Como Funciona

### **1. Formulário de Cadastro**

- ✅ **Campo obrigatório:** Tipo de Usuário
- ✅ **Opções:** Docente ou Servidor
- ✅ **Valor padrão:** Docente
- ✅ **Estilo:** Consistente com outros campos

### **2. Processamento**

- ✅ **Role salvo:** O tipo selecionado é salvo no banco
- ✅ **Menu dinâmico:** Sidebar se adapta ao tipo escolhido
- ✅ **Header personalizado:** Mostra o tipo no header da sidebar

## 📋 Campos do Formulário

### **Formulário Completo:**

1. **Nome** - Nome completo do usuário
2. **E-mail** - Email institucional
3. **Tipo de Usuário** - **NOVO** - Dropdown (Docente/Servidor)
4. **SIAPE** - Número do SIAPE
5. **Senha** - Senha de acesso

### **Dropdown de Tipo:**

```html
<select name="role" value="{formData.role}">
  <option value="docente">Docente</option>
  <option value="servidor">Servidor</option>
</select>
```

## 🎨 Interface

### **Estilo do Dropdown:**

- ✅ **Cor:** Texto gray-200
- ✅ **Fundo:** Transparente
- ✅ **Borda:** gray-400 (inferior)
- ✅ **Focus:** blue-dark
- ✅ **Opções:** gray-200 com bg-gray-100

### **Posicionamento:**

- ✅ **Localização:** Ao lado do campo SIAPE
- ✅ **Espaçamento:** Consistente com outros campos
- ✅ **Responsivo:** Funciona em todos os tamanhos

## 🔄 Fluxo de Cadastro

### **1. Usuário Preenche:**

```
Nome: João Silva
E-mail: joao.silva@universidade.edu
Tipo: Docente ← Seleciona no dropdown
SIAPE: 123456
Senha: docente123
```

### **2. Sistema Processa:**

```javascript
const newUser = {
  name: "João Silva",
  email: "joao.silva@universidade.edu",
  role: "docente", // ← Tipo selecionado
  siape: "123456",
  password: "docente123",
};
```

### **3. Sidebar Renderiza:**

- **Header:** "DOCENTE"
- **Menu:** Dashboard, Minhas Reservas, Nova Reserva, Histórico, Meu Perfil

## 🧪 Testando

### **Cadastro de Docente:**

1. **Acesse** a página de cadastro
2. **Selecione:** "Docente" no dropdown
3. **Preencha:** Demais campos
4. **Cadastre:** Faça login
5. **Verifique:** Sidebar mostra "DOCENTE"

### **Cadastro de Servidor:**

1. **Acesse** a página de cadastro
2. **Selecione:** "Servidor" no dropdown
3. **Preencha:** Demais campos
4. **Cadastre:** Faça login
5. **Verifique:** Sidebar mostra "SERVIDOR"

## 🔧 Configuração Técnica

### **Componente Register:**

```javascript
const [formData, setFormData] = useState({
  name: "",
  email: "",
  siape: "",
  password: "",
  role: "docente", // ← Valor padrão
});
```

### **Serviço de Autenticação:**

```javascript
const newUser = {
  // ... outros campos
  role: userData.role || "docente", // ← Usa o role fornecido
};
```

### **Configuração de Menus:**

```javascript
export const servidorMenu = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard },
  { id: "minhas-reservas", label: "Minhas Reservas", icon: ClipboardList },
  { id: "nova-reserva", label: "Nova Reserva", icon: Calendar },
  { id: "historico", label: "Histórico", icon: Clock },
  { id: "perfil", label: "Meu Perfil", icon: Users },
];
```

## ✅ Benefícios

- **🎯 Específico:** Cada tipo tem seu menu apropriado
- **🔒 Seguro:** Controle de acesso por tipo
- **📊 Organizado:** Separação clara entre docentes e servidores
- **🔄 Dinâmico:** Sidebar se adapta automaticamente
- **📝 Flexível:** Fácil adicionar novos tipos

## 🔮 Futuras Expansões

### **Possíveis Tipos Adicionais:**

- **Aluno:** Para estudantes
- **Coordenador:** Para coordenações
- **Direção:** Para diretores
- **Portaria:** Para portaria

### **Menus Específicos:**

- Cada tipo pode ter funcionalidades únicas
- Permissões diferentes por tipo
- Relatórios específicos

---

_Sistema de Reservas da Universidade (SIRU) - Cadastro com Tipos de Usuário_
