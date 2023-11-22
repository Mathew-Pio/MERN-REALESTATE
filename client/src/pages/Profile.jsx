import React from 'react'
import { useContext, useState, useEffect } from 'react'
import { authContext } from '../../context/AuthContext'
import { useRef } from 'react';
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from 'firebase/storage'
import {app} from '../firebase'
import { Link } from 'react-router-dom';

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
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([])

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

    const handleShowListings = async (req, res) => {
      try{
        setShowListingsError(false);
        const res = await fetch(`/api/user/listing/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        })
        
        const data = await res.json();
        console.log(data.data);
        setUserListings(data.data);
        if(data.success === false){
          setShowListingsError(true);
          return;
        }
      }catch(err){
        setShowListingsError(true);
      }
    };

    const handleListDelete = async (listingId) => {
      try{
        const res = await fetch(`/api/listing/${listingId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });
        const data = await res.json();
        if(data.success === false){
          console.log(data.message);
          return;
        }
          setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));
      }catch(error){
        console.log(error.message)
      }
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
        <Link className='bg-green-700 text-white p-3 rounded-lg text-center hover:opacity-95' to='/create-listing'>
          Create Listing
        </Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>Delete account</span>
        <span onClick={logout} className='text-red-700 cursor-pointer'>Sign out</span>
      </div>
      <p className='text-red-700 mt-5'>
        {error ? error : ''}
      </p>
      <button onClick={handleShowListings} className='text-green-700 w-full'>Show your listings</button>
      <p className='text-red-700 mt-5'>{showListingsError ? 'Error showing listings': ''}</p>
    
      {userListings &&
       userListings.length > 0 && 
       <div className='flex flex-col gap-4'>
         <h1 className='text-center mt-7 text-2xl font-semibold'>Your listings</h1>
         {userListings.map((listing) => 
           <div key={listing._id} className='border rounded-lg p-3 flex justify-between items-center gap-4'>
             <Link to={`/listing/${listing._id}`}>
               <img className='h-20 w-20 object-contain rounded-lg' src={listing.imageUrls[0]} alt='listing image' />
             </Link>
             <Link>
               <p className='text-slate-700 font-semibold truncate flex-1 hover:underline'>{listing.name}</p>
             </Link>
             <div className='flex flex-col items-center'>
               <button onClick={() => handleListDelete(listing._id)} className='text-red-700 uppercase'>Delete</button>
               <Link to={`/update-listing/${listing._id}`}>
               <button className='text-green-700 uppercase'>Edit</button>
               </Link>
             </div>
           </div>
         )
       }
       </div>}
    </div>
  )
}
