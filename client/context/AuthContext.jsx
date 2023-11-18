import { useContext, useEffect, useReducer, createContext } from "react";

// const getToken = () => localStorage.getItem('token') !== 'undefined' ? localStorage.getItem('token') : null;

const initialState = {
    user: localStorage.getItem('user') !== undefined ? JSON.parse(localStorage.getItem('user')) : null,
    token: localStorage.getItem('token') !== undefined ? localStorage.getItem('token') : null,
    id: localStorage.getItem('id') || null,
}

console.log(localStorage);

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
            token: action.payload.token,
        } 
        
        case 'LOGOUT':
        return {
            id:null,
            token:null
        }

        case 'UPDATE_SUCCESS':
            return {
                id: action.payload.id,
                user: action.payload.user,
                token: action.payload.token,
            }

        default:
        return state;
    }
}

export const AuthContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(authReducer, initialState)

    useEffect(() => {
        localStorage.setItem('user', JSON.stringify(state.user))
        if(state.token !== null) {
            localStorage.setItem('token', state.token);
          }
        localStorage.setItem('id', state.id)
    },[state])
    //  // Define getToken function here
    //  const getToken = () => state.token;
    console.log(state.user)
    console.log(state.token);
    return <authContext.Provider value={{id:state.id, user: state.user, token:state.token, dispatch}}>
        {children}
    </authContext.Provider>
}