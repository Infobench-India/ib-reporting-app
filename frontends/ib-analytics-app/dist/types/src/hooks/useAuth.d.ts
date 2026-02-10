declare function useAuth(): {
    getSession: () => Promise<any>;
    isAuth: () => Promise<boolean>;
    logout: () => Promise<void>;
};
export default useAuth;
