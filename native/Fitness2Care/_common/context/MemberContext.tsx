import React, {createContext, ReactNode, useContext, useState} from 'react';

export interface MemberContextProps {
    member: IMember | null,
    setMember: ((user:IMember | null)=>void)
}

export const MemberContext = createContext<MemberContextProps|null>(null);

export const useMemberContext = () => {
    const context = useContext(MemberContext);
    if (!context) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
};

export const MemberProvider = ({ children }: { children: ReactNode }) => {
    const [member, setMember] = useState<IMember | null>(null);

    return (
        <MemberContext.Provider value={{ member, setMember }}>
            {children}
        </MemberContext.Provider>
    );
};

