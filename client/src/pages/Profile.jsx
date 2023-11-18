import React from 'react'
import { useContext, useState, useEffect } from 'react'
import { authContext } from '../../context/AuthContext'
import { useRef } from 'react';
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from 'firebase/storage'
import {app} from '../firebase'

export default function Profile() {
  const fileRef = useRef(null);
  const {user,token} = useContext(authContext);
  const {dispatch} = useContext(authContext);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  
  // firebase storage
  // allow read;
  //  allow if: 
  //  request.resource.size < 2 * 1024 * 1024 && 
  //  request.resource.contentType.matches('image/.*')

  useEffect(() => {
    if(file){
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setFilePerc(Math.round(progress))
    },
    (error) => {
      setFileUploadError(true);
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        setFormData({ ...formData, avatar: downloadURL })
    });
    }
    );
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      setLoading(true);
      const res = await fetch(`/api/user/${user._id}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json();
      console.log(data);
      if(data.success === false){
        setLoading(false);
        setError(data.message);
        return;
      }
      dispatch({
        type:'UPDATE_SUCCESS',
        payload:{
          id: data.data._id,
          user: data.data,
          token: token
        }
      })
      console.log(token);
      setLoading(false);
      setError(null);
    }catch(error){
      setLoading(false);
      setError(error);
      console.log(error);
    }
  }

    const handleDeleteUser = async (e) => {
      e.preventDefault();
      try{
        setLoading(true);
      const res = await fetch(`/api/user/${user._id}`, {
        method: 'DELETE', 
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json();
      console.log(data);
      if(data.success === false){
        setLoading(false);
        setError(data.message);
        return;
      }
      dispatch({
        type:'DELETE_SUCCESS',
        payload:{
          id: null,
          user: null,
          token: null
        }
      })
      setLoading(false);
      setError(null);
      }catch(error){
        setLoading(false);
        setError(error);
        console.log(error);
      }
    }

    const logout = async (e) => {
      e.preventDefault();

      dispatch({
        type:'LOGOUT',
        payload:{
          id: null,
          user: null,
          token: null
        }
      })
      // Clear the token from local storage
      localStorage.removeItem('token');

    }

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input onChange={(e) => setFile(e.target.files[0])} type='file' ref={fileRef} hidden accept='image/*' />
        <img onClick={() => fileRef.current.click()} src={ formData.avatar || user.avatar} alt='profile pic' className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'/>
        <p className='text-sm self-center'>
          {fileUploadError ? (
          <span className='text-red-700'>
            Error image upload (image must be less than 2mb)
          </span>
          ) :
          filePerc > 0 && filePerc < 100 ? (
            <span className='text-slate-700'>
              {`Uploading ${filePerc}%`}
            </span>
            ) :
            filePerc === 100 ? (
              <span className='text-green-700'>Image successfully uploaded!</span>
              ) : ( ''
        )}
        </p>
        <input type='text' defaultValue={user.username} onChange={handleChange} placeholder='username' id='username' className='border p-3 rounded-lg'/>
        <input type='email' defaultValue={user.email} onChange={handleChange} placeholder='email' id='email' className='border p-3 rounded-lg'/>
        <input type='text' placeholder='password' id='password' className='border p-3 rounded-lg'/>
        <button disabled={loading} className='bg-slate-700 text-white rounded-lg p-3 hover:opacity-50 disabled:placeholder-opacity-80'>{loading ? 'Loading...': 'Update' }</button>
      </form>
      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>Delete account</span>
        <span onClick={logout} className='text-red-700 cursor-pointer'>Sign out</span>
      </div>
      <p className='text-red-700 mt-5'>
        {error ? error : ''}
      </p>
    </div>
  )
}
