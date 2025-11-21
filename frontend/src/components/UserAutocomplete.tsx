import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

interface UserAutocompleteProps {
  onSelect: (user: User) => void;
  placeholder?: string;
}

export const UserAutocomplete = ({ onSelect, placeholder = 'Search users...' }: UserAutocompleteProps) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (query.length < 2) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const data = await api.get<User[]>(`/auth/users?search=${encodeURIComponent(query)}`);
        setUsers(data);
        setIsOpen(true);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (user: User) => {
    onSelect(user);
    setQuery('');
    setUsers([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading && (
        <div className="absolute right-3 top-3">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {isOpen && users.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelect(user)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex flex-col"
            >
              <span className="font-medium">{user.name || user.username}</span>
              <span className="text-sm text-gray-500">{user.email}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && users.length === 0 && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg px-4 py-2 text-gray-500">
          No users found
        </div>
      )}
    </div>
  );
};