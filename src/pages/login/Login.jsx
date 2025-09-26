import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const Login = ({ onShowRegister }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData.email, formData.password);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-blue-700 flex">
      {/* Container branco - lado direito */}
      <div className="bg-white w-full max-w-4xl rounded-tl-[20px] px-8 md:px-16 lg:px-24 py-16 md:py-12 shadow-2xl font-lato ml-auto">
        {/* Logo e título */}
        <div className="mb-12 flex justify-center">
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
            <h2 className="text-gray-200 font-bold text-xl mb-2">
              Acesse o portal
            </h2>

            {/* Subtítulo */}
            <p className="text-gray-300 text-xs mb-6">
              Entre usando seu e-mail e senha cadastrados
            </p>

            {/* Mensagem de erro */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            {/* Campo de E-mail */}
            <div className="mb-4">
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

            {/* Campo de Senha */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-gray-300 text-xs font-medium mb-2"
              >
                SENHA
              </label>
              <div className="relative  ">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Digite sua senha"
                  className="w-full py-2 pr-10 border-b border-gray-400 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-dark transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 mr-5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-200 text-white py-3 rounded-lg font-medium hover:bg-blue-dark transition-colors duration-200 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* Links Esqueceu a senha e Criar conta */}
        <div className="mt-3 flex justify-center items-center gap-4 md:gap-6 w-full max-w-md mx-auto">
          <a
            href="#"
            className="text-gray-300 text-xs md:text-sm hover:text-blue-dark transition-colors"
            onClick={(e) => {
              e.preventDefault();
              console.log("Esqueceu a senha clicado");
            }}
          >
            Esqueceu a senha?
          </a>
          <span className="text-gray-400">•</span>
          <a
            href="#"
            className="text-gray-300 text-xs md:text-sm hover:text-blue-dark transition-colors"
            onClick={(e) => {
              e.preventDefault();
              onShowRegister();
            }}
          >
            Criar conta
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
