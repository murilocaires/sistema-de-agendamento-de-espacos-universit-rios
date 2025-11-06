import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Search, X } from 'lucide-react';

export const SearchableUserInput = ({ users, selectedUserId, onSelect, onClear, required = false }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.user-search-container')) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const getUserDisplayName = (userId) => {
        const foundUser = users.find(u => u.id === parseInt(userId));
        return foundUser ? `${foundUser.name} (${foundUser.role}) - ${foundUser.email}` : 'Usuário não encontrado';
    };

    const filteredUsers = searchTerm.trim() === "" 
        ? users 
        : users.filter(user => {
            const searchLower = searchTerm.toLowerCase();
            const userName = user.name.toLowerCase();
            const userEmail = user.email.toLowerCase();
            const userRole = user.role.toLowerCase();
            return userName.includes(searchLower) || userEmail.includes(searchLower) || userRole.includes(searchLower);
        });

    const handleClear = () => {
        setSearchTerm("");
        setIsDropdownOpen(false);
        if (onClear) onClear();
    };

    return (
        <div className="relative user-search-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                <UsersIcon size={16} className="inline mr-1" />
                Usuário
            </label>
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={selectedUserId ? getUserDisplayName(selectedUserId) : searchTerm}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (selectedUserId) {
                                handleClear();
                                setSearchTerm(value);
                            } else {
                                setSearchTerm(value);
                            }
                            setIsDropdownOpen(true);
                        }}
                        onFocus={() => {
                            if (!selectedUserId) {
                                setIsDropdownOpen(true);
                            }
                        }}
                        placeholder={selectedUserId ? "" : "Digite para buscar um usuário..."}
                        required={required && !selectedUserId}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {selectedUserId && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                handleClear();
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
                {isDropdownOpen && !selectedUserId && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => {
                                        onSelect(user.id);
                                        setSearchTerm("");
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                                >
                                    <div className="font-medium text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-600">{user.role} - {user.email}</div>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-gray-500 text-sm">
                                Nenhum usuário encontrado
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

