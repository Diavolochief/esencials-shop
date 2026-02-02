export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    // AGREGA ESTO:
    avatar?: string;
    phone?: string;
    address?: string;
    neighborhood?: string;
    city?: string;
    zip_code?: string;
    created_at?: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    // AGREGA ESTO PARA EL CARRITO:
    cart_global: {
        count: number;
        total: number;
        items: any;
    };
    flash: {
        success: string | null;
        error: string | null;
        warning: string | null;
    };
};