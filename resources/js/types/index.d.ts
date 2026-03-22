// Ziggy のグローバル route() 関数の型宣言
declare function route(name: string, params?: Record<string, unknown> | number | string): string;

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    timezone: string;
    week_start: 'monday' | 'sunday';
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    user_id: number;
    name: string;
    color: string;
    is_favorite: boolean;
    created_at: string;
    updated_at: string;
}

export interface WorkLog {
    id: number;
    user_id: number;
    category_id: number;
    category?: Category;
    started_at: string;
    ended_at: string;
    duration_seconds: number;
    memo: string | null;
    created_at: string;
    updated_at: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    links: PaginationLink[];
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        per_page: number;
        to: number | null;
        total: number;
    };
}

// Inertia 共有 Props の型拡張
declare module '@inertiajs/core' {
    interface PageProps {
        auth: {
            user: User;
        };
        flash: {
            message?: string;
            error?: string;
        };
        subscription: {
            isSubscribed: boolean;
            onTrial: boolean;
        };
    }
}

// PageProps 型（Pages コンポーネントで extends して使用）
export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash: {
        message?: string;
        error?: string;
    };
    subscription: {
        isSubscribed: boolean;
        onTrial: boolean;
    };
};
