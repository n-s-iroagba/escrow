const API_ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH_ACCESS_TOKEN: '/auth/refresh-token',
        VERIFY_EMAIL: '/auth/verify-email',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
    },
    ESCROWS: {
        GET_ALL: '/escrow', // Admin or cleanup
        GET_MY: '/escrow/my-escrows',
        CREATE: '/escrow/initiate',
        GET_ADMIN_ALL: '/escrow/all',
        ADMIN_UPDATE: (id: string) => `/escrow/${id}/admin-update`,
        GET_ONE: (id: string) => `/escrow/${id}`,
        GET_FUNDING_DETAILS: (id: string) => `/escrow/${id}/funding-details`,
        FUND: (id: string) => `/escrow/${id}/fund`,
    },
    BANKS: {
        GET_ALL: '/banks',
        CREATE: '/banks',
        GET_ONE: (id: string) => `/banks/${id}`,
        UPDATE: (id: string) => `/banks/${id}`,
        DELETE: (id: string) => `/banks/${id}`,
    },
    KYC: {
        STATUS: (userId?: string) => `/kyc/status/${userId}`,
        SUBMIT: '/kyc/submit',
    },
    USERS: {
        GET_ALL: '/users',
    },
    WALLETS: {
        GET_ALL: '/custodial-wallets',
        CREATE: '/custodial-wallets',
        GET_ONE: (id: string) => `/custodial-wallets/${id}`,
        UPDATE: (id: string) => `/custodial-wallets/${id}`,
    }
}
export default API_ROUTES