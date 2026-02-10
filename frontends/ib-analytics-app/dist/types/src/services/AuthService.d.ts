declare function getSession(): Promise<any>;
declare function isAuth(): Promise<boolean>;
declare function logout(): Promise<void>;
export { getSession, isAuth, logout };
