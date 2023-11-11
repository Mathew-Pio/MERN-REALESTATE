import { useContext, useEffect, useReducer, createContext } from "react";

const initialState = {
    id: null,
    user: null,
    token:null
}

export const authContext = createContext(initialState);

const authReducer = (state, action) => {
    switch(action.type){
        case 'LOGIN_START':
        return {
            id: null,
            user: null,
            token:null
        };

        case 'LOGIN_SUCCESS':
        return {
            id:action.payload.id,
            user: action.payload.user,
            token: action.payload.token
        }

        case 'LOGOUT':
        return {
            id:null,
            token:null
        }

        default:
        return state;
    }
}

export const AuthContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(authReducer, initialState)
    return <authContext.Provider value={{id:state.id, token:state.token, dispatch}}>
        {children}
    </authContext.Provider>
}