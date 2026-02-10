import type { User } from "../../types/customTypes";
export declare function fetchUserProfile(user: {
    id: string;
    name: string;
    role: string;
}): Promise<User>;
