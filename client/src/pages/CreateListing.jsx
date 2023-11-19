import React from 'react'
import { useState } from 'react';
import { app } from '../firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function CreateListing() {
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  return (
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>
        Create a listing
      </h1>
      <form className='flex flex-col sm:flex-row gap-4'>
        <div className='flex flex-col gap-4 flex-1'>
          <input type='text' placeholder='name' className="border p-3 rounded-lg" id='name' maxLength="10" minLength='10' required />
          <textarea type='text' placeholder='description' className="border p-3 rounded-lg" id='description' required />
          <input type='text' placeholder='address' className="border p-3 rounded-lg" id='address' required />
        <div className='flex gap-6 p-3 flex-wrap'>
          <div className='flex gap-2'>
            <input type='checkbox' id='sale' className='w-5' />
            <span>Sell</span>
          </div>
          <div className='flex gap-2'>
            <input type='checkbox' id='rent' className='w-5' />
            <span>Rent</span>
          </div>
          <div className='flex gap-2'>
            <input type='checkbox' id='parking' className='w-5' />
            <span>Parking Spot</span>
          </div>
          <div className='flex gap-2'>
            <input type='checkbox' id='furnished' className='w-5' />
            <span>Furnished</span>
          </div>
          <div className='flex gap-2'>
            <input type='checkbox' id='offer' className='w-5' />
            <span>Offer</span>
          </div>
        </div>
        <div className='flex flex-wrap gap-6'>
          <div className='flex items-center gap-2'>
            <input type='number' id='bedrooms' className='p-3 border border-gray-300 rounded-lg' min='1' required />
            <p>Beds</p>
          </div>
          <div className='flex items-center gap-2'>
            <input type='number' id='bathrooms' className='p-3 border border-gray-300 rounded-lg' min='1' required />
            <p>Baths</p>
          </div>
          <div className='flex items-center gap-2'>
            <input type='number' id='regularPrice' className='p-3 border border-gray-300 rounded-lg' min='1' required />
            <div className='flex flex-col items-center'>
              <p>Regular Price</p>
              <span className="text-xs">($ / Month)</span>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <input type='number' id='discountPrice' className='p-3 border border-gray-300 rounded-lg' min='1' required />
            <div className='flex flex-col items-center'>
              <p>Discount Price</p>
              <span className='text-xs'>($ / month)</span>
            </div>
          </div> 
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
      <button className='p-3 bg-slate-700 text-white hover:opacity-95 disabled:opacity-80 uppercase rounded-lg'>Create Listing</button>
       </div>
      </form>
    </main>
  )
}
