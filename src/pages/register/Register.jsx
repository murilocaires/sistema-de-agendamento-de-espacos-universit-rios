import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../services/authService";
import SuccessAnimation from "../../components/SuccessAnimation";
import AutocompleteDropdown from "../../components/AutocompleteDropdown";

const Register = ({ onBackToLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSiapeDropdown, setShowSiapeDropdown] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    siape: "",
    password: "",
  });

  // Sugestões de SIAPE (simulando dados reais)
  const siapeSuggestions = [
    "Murilo",
    "KernelCooperativo V2",
    "Reunião de planejamento 2024",
    "sala de reuniões",
    "hjreher",
    "Auditório",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Mostrar dropdown para SIAPE quando começar a digitar
    if (name === "siape" && value.length > 0) {
      setShowSiapeDropdown(true);
    } else if (name === "siape" && value.length === 0) {
      setShowSiapeDropdown(false);
    }
  };

  const handleSiapeSelect = (suggestion) => {
    setFormData((prevState) => ({
      ...prevState,
      siape: suggestion,
    }));
    setShowSiapeDropdown(false);
  };

  const handleSiapeFocus = () => {
    if (formData.siape.length > 0) {
      setShowSiapeDropdown(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Cadastrar usuário no banco de dados
      await registerUser(formData);

      // Limpar formulário
      setFormData({
        name: "",
        email: "",
        siape: "",
        password: "",
      });

      // Mostrar animação de sucesso
      setShowSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    onBackToLogin();
  };

  return (
    <>
      {showSuccess && <SuccessAnimation onComplete={handleSuccessComplete} />}
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-blue-700 flex">
        {/* Container branco - lado direito */}
        <div className="bg-white w-full max-w-4xl rounded-tl-[20px] px-8 md:px-16 lg:px-24 py-16 md:py-12 shadow-2xl font-lato ml-auto">
          {/* Logo e título */}
          <div className="mb-8 flex justify-center">
            <div className="flex items-center justify-center w-full max-w-md">
              {/* Logo */}
              <img src="/logo.svg" alt="Logo" className="w-12 h-12 mr-3" />
              <h1 className="text-blue-dark font-bold text-lg leading-tight max-w-[286px]">
                sistema de agendamentos de espaços universitário
              </h1>
            </div>
          </div>

          {/* Caixa do formulário */}
          <div className="w-full max-w-md rounded-[10px] border border-gray-400 p-6 mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col">
              {/* Título do formulário */}
              <h2 className="text-gray-200 font-bold text-xl mb-4">
                Crie sua conta
              </h2>

              {/* Mensagem de erro */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              {/* Campo de Nome */}
              <div className="mb-3">
                <label
                  htmlFor="name"
                  className="block text-gray-300 text-xs font-medium mb-2"
                >
                  NOME
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Digite o nome completo"
                  className="w-full py-2 border-b border-gray-400 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-dark transition-colors"
                  required
                />
              </div>

              {/* Campo de E-mail */}
              <div className="mb-3">
                <label
                  htmlFor="email"
                  className="block text-gray-300 text-xs font-medium mb-2"
                >
                  E-MAIL
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="exemplo@mail.com"
                  className="w-full py-2 border-b border-gray-400 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-dark transition-colors"
                  required
                />
              </div>

              {/* Campo de SIAPE */}
              <div className="mb-3 relative">
                <label
                  htmlFor="siape"
                  className="block text-gray-300 text-xs font-medium mb-2"
                >
                  SIAPE
                </label>
                <input
                  type="text"
                  id="siape"
                  name="siape"
                  value={formData.siape}
                  onChange={handleInputChange}
                  onFocus={handleSiapeFocus}
                  placeholder="Digite o seu siape"
                  className="w-full py-2 border-b border-gray-400 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-dark transition-colors"
                  required
                />
                <AutocompleteDropdown
                  isOpen={showSiapeDropdown}
                  suggestions={siapeSuggestions}
                  onSelect={handleSiapeSelect}
                  onClose={() => setShowSiapeDropdown(false)}
                />
              </div>

              {/* Campo de Senha */}
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-gray-300 text-xs font-medium mb-2"
                >
                  SENHA
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Digite sua senha"
                  className="w-full py-2 border-b border-gray-400 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-dark transition-colors"
                  required
                />
                <p className="text-gray-300 text-xs mt-1">
                  Mínimo de 6 dígitos
                </p>
              </div>

              {/* Botão Cadastrar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-200 text-white py-3 rounded-lg font-medium hover:bg-blue-dark transition-colors duration-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Cadastrando..." : "Cadastrar"}
              </button>
            </form>
          </div>

          {/* Link Voltar para Login */}
          <div className="mt-2 flex justify-center items-center gap-4 md:gap-6 w-full max-w-md mx-auto">
            <a
              href="#"
              className="text-gray-300 text-xs md:text-sm hover:text-blue-dark transition-colors"
              onClick={(e) => {
                e.preventDefault();
                onBackToLogin();
              }}
            >
              Já tem uma conta? Faça login
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
