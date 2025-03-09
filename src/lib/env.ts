interface Env {
    TOKEN: string;
    CLIENT_ID: string;
}

export const $e = (key: keyof Env | (string & {})): string => {
    const value = process.env[key];
    if (value === undefined) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};
