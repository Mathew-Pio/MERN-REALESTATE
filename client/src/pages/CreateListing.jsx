import React from 'react'
import { useState, useContext } from 'react';
import { app } from '../firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { authContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CreateListing() {
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();
  const {user,token} = useContext(authContext);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 50,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  console.log(formData);
  const handleImageSubmit = (e) => {
    e.preventDefault();
    if(files.length > 0 && files.length + formData.imageUrls.length < 7){
      setUploading(true);
      setImageUploadError(false)
      const promises = [];

      for (let i=0; i < files.length; i++){
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises).then((urls) => {
        setFormData({...formData, imageUrls: formData.imageUrls.concat(urls) });
        setImageUploadError(false);
        setUploading(false);
      }).catch((err) => {
        setImageUploadError('Image upload failed (max of 2mb each per image)')
        setUploading(false);
      })
    }else{
      setImageUploadError('You can only upload 6 images per listing')
      setUploading(false);
    }
  }

  const storeImage  = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        ()=>{
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          })
        }
      )
    });
  }

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls:formData.imageUrls.filter((_, i) => i !== index)
    })
  }

  const handleChange = (e) => {
    if(e.target.id === 'sale' || e.target.id === 'rent'){
      setFormData({
        ...formData,
        type: e.target.id
      })
    }

    if(e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer'){
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked
      })
    }

    if(e.target.type === 'number' || e.target.type === 'text' || e.target.type === 'textarea'){
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  }

  const handleSubmit = async(e) => {
    e.preventDefault();
    try{
      if(formData.imageUrls.length < 1) return setError('You must upload at least one image')
      if(+formData.regularPrice <= +formData.discountPrice) return setError('Discount must be lower than regular price')
      setLoading(true);
      setError(error);
      const res = await fetch('/api/listing/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          userRef: user._id
        }),
      });
      const data = await res.json();
      setLoading(false);
      console.log(data);
      if(data.success === false){
        setError(data.message);
      }
      navigate(`/listing/${data.data._id}`)
    }catch(error){
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>
        Create a listing
      </h1>
      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
        <div className='flex flex-col gap-4 flex-1'>
          <input onChange={handleChange} value={formData.name} type='text' placeholder='name' className="border p-3 rounded-lg" id='name' maxLength="35" minLength='3' required />
          <textarea onChange={handleChange} value={formData.description} type='text' placeholder='description' className="border p-3 rounded-lg" id='description' required />
          <input onChange={handleChange} value={formData.address} type='text' placeholder='address' className="border p-3 rounded-lg" id='address' required />
        <div className='flex gap-6 p-3 flex-wrap'>
          <div className='flex gap-2'>
            <input onChange={handleChange} checked={formData.type === 'sale'} type='checkbox' id='sale' className='w-5' />
            <span>Sell</span>
          </div>
          <div className='flex gap-2'>
            <input onChange={handleChange} checked={formData.type === 'rent'} type='checkbox' id='rent' className='w-5' />
            <span>Rent</span>
          </div>
          <div className='flex gap-2'>
            <input onChange={handleChange} checked={formData.parking} type='checkbox' id='parking' className='w-5' />
            <span>Parking Spot</span>
          </div>
          <div className='flex gap-2'>
            <input onChange={handleChange} checked={formData.furnished} type='checkbox' id='furnished' className='w-5' />
            <span>Furnished</span>
          </div>
          <div className='flex gap-2'>
            <input onChange={handleChange} checked={formData.offer} type='checkbox' id='offer' className='w-5' />
            <span>Offer</span>
          </div>
        </div>
        <div className='flex flex-wrap gap-6'>
          <div className='flex items-center gap-2'>
            <input onChange={handleChange} checked={formData.bedrooms} type='number' id='bedrooms' className='p-3 border border-gray-300 rounded-lg' min='1' required />
            <p>Beds</p>
          </div>
          <div className='flex items-center gap-2'>
            <input onChange={handleChange} checked={formData.bathrooms} type='number' id='bathrooms' className='p-3 border border-gray-300 rounded-lg' min='1' required />
            <p>Baths</p>
          </div>
          <div className='flex items-center gap-2'>
            <input onChange={handleChange} checked={formData.regularPrice} type='number' id='regularPrice' className='p-3 border border-gray-300 rounded-lg' min='50' required />
            <div className='flex flex-col items-center'>
              <p>Regular Price</p>
              <span className="text-xs">($ / Month)</span>
            </div>
          </div>
          {formData.offer && (
          <div className='flex items-center gap-4'>
            <input onChange={handleChange} checked={formData.discountPrice} type='number' id='discountPrice' className='p-3 border border-gray-300 rounded-lg' min='0' required />
            <div className='flex flex-col items-center'>
              <p>Discount Price</p>
              <span className='text-xs'>($ / month)</span>
            </div>
          </div> 
          )}
        </div> 
       </div>
       <div className='flex flex-col flex-1 gap-4'>
        <p className='font-semibold'>Images:
        <span className='font-normal '>The first image will be the cover (maximum of 6 images)</span>
        </p>
        <div className='flex gap-4'>
          <input onChange={(e) => setFiles(e.target.files)} className='p-3 border border-gray-300 rounded-w-full' type="file" id='images' accept='images/*' multiple />
          <button type='button' disabled={uploading} onClick={handleImageSubmit} className='p-3 text-green-700 border border-green-700 rounded hover:shadow-lg disabled:opacity-80'>{uploading ? 'Uploading...' : 'Upload'}</button>
        </div>
        <p className='text-red-700'>{imageUploadError && imageUploadError}</p>
        {
          formData.imageUrls.length > 0 && formData.imageUrls.map((url, index) => (
            <div key={url} className='flex justify-between p-3 border items-center'>
              <img src={url} alt='Listing image' className='w-40 h-20 object-contain rounded-lg' />
              <button type='button' onClick={() => handleRemoveImage(index)} className='text-red-700 p-3 rounded-lg hover:opacity-95'>delete</button>
            </div>
          ))
        }
      <button disabled={loading || uploading} className='p-3 bg-slate-700 text-white hover:opacity-95 disabled:opacity-80 uppercase rounded-lg'>
        {loading ? 'Creating...' : 'Create listing'}
      </button>
      {error && <p className='text-red-700'>{error}</p>}
       </div>
      </form>
    </main>
  )
}
