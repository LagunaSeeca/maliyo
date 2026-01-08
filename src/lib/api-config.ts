export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const getApiUrl = (path: string) => {
    return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};
