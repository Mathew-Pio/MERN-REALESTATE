import React from 'react'
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase'
import { useContext } from 'react'
import {authContext} from '../../context/AuthContext.jsx'
import {useNavigate} from 'react-router-dom';

export default function OAuth() {
  const {dispatch} = useContext(authContext)
  const navigate = useNavigate();
    const handleGoogleClick = async () => {
        try{
            const provider = new GoogleAuthProvider();
            const auth = getAuth(app);

            const result = await signInWithPopup(auth, provider)
            
            const res = await fetch('/api/auth/google', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name: result.user.displayName, email: result.user.email, photo: result.user.photoURL })
            })
            const data = await res.json();
            dispatch({
              type:'LOGIN_SUCCESS',
              payload:{
                id: data.data._id,
                user: data.user,
                token: data.token
              }
            })
            navigate('/');
            console.log(data, 'login data');
        }catch(error){
            console.error('could not sign in with google', error)
        }
    }

  return (
    <button onClick={handleGoogleClick} type='button' className='bg-red-700 text-white p-3 rounded-lg uppercase hover:placeholder-opacity-95'>Continue with google</button>
  )
}
