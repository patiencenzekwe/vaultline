export interface User {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    created_at: string;
}

export interface Account {
    id: string;
    user_id: string;
    account_type: 'current' | 'savings';
    account_number: string;
    balance: string;
    currency: string;
    created_at: string;
}

export interface Transaction {
    id: string;
    account_id: string;
    transaction_type: string;
    amount: string;
    balance_after: string;
    description: string;
    reference: string;
    created_at: string;
}

export interface Transfer {
    id: string;
    from_account_id: string;
    to_account_id: string;
    amount: string;
    description: string;
    status: string;
    reference: string;
    created_at: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, full_name: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}