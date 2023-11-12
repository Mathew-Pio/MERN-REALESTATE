import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useContext } from 'react'
import {authContext} from '../../context/AuthContext.jsx'
import OAuth from '../components/OAuth.jsx';

export default function Signin() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();
  const {dispatch} = useContext(authContext)
  const handleChange = (e) => {
    setFormData(
      {
        ...formData,
        [e.target.id]: e.target.value,
      }
    )
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if(data.success === false){
        setLoading(false);
        setError(data.message);
        return;
      }

      dispatch({
        type:'LOGIN_SUCCESS',
        payload:{
          id: data.data._id,
          user: data.user,
          token: data.token
        }
      })

      console.log(data, 'login data');
      setLoading(false);
      setError(null);
      navigate('/');
    }catch(error){
      setLoading(false);
      setError(error);
      console.log(error);
    }
  };
  console.log(formData);
  return (
    <div className='p-3 max-w-lg mx-auto'>
    <h1 className='text-3xl text-center font-semibold my-7'>Sign In</h1>
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      <input type='email' placeholder='email' className='border p-3 rounded-lg' id='email' onChange={handleChange} />
      <input type='password' placeholder='password' className='border p-3 rounded-lg' id='password' onChange={handleChange} />
      <button disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
        {loading ? 'Loading...' : 'Sign In'}
      </button>
      <OAuth/>
    </form>
    <div className='flex gap-2 mt-5'>
      <p>Dont have an account?</p>
      <Link to={'/sign-up'}>
        <span className='text-blue-700'>Sign Up</span>
      </Link>
    </div>
    {error && <p className='text-red-500 mt-5'>(error)</p>}
    </div>
  )
}
