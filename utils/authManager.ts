
import { User } from '../types';

const USERS_KEY = 'hdfc_users';
const SESSION_KEY = 'hdfc_session';

const INITIAL_BALANCE = 356000.00;

const SEED_USER: User = {
  id: "9727180908",
  password: "_Aru@1809",
  name: "Armaan Barai",
  phone: "9727180908",
  vpa: "9727180908@hdfc",
  balance: 356000.00
};

export const getUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (!stored) {
      // Seed initial user if no users exist
      const initialUsers = [SEED_USER];
      localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
      return initialUsers;
    }
    return JSON.parse(stored);
  } catch (e) {
    return [SEED_USER];
  }
};

export const registerUser = (user: Omit<User, 'balance'>): boolean => {
  const users = getUsers();
  if (users.find(u => u.id === user.id)) {
    return false; // User exists
  }
  
  const newUser: User = {
    ...user,
    balance: INITIAL_BALANCE
  };
  
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  loginUser(user.id, user.password); // Auto login
  return true;
};

export const loginUser = (id: string, pass: string): boolean => {
  const users = getUsers();
  const user = users.find(u => u.id === id && u.password === pass);
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return true;
  }
  return false;
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};

export const deductBalance = (amount: number): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;

  // Refresh user data from DB to ensure balance is up to date
  const users = getUsers();
  const dbUserIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (dbUserIndex === -1) return false;
  
  if (users[dbUserIndex].balance < amount) {
    return false; // Insufficient funds
  }

  // Deduct
  users[dbUserIndex].balance -= amount;
  
  // Update DB
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Update Session
  localStorage.setItem(SESSION_KEY, JSON.stringify(users[dbUserIndex]));
  
  return true;
};