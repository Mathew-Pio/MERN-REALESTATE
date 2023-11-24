import { useEffect, useState } from 'react'
import { useContext } from 'react';
import { authContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Contact({listing}) {
  const {token} = useContext(authContext);
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState('');
  const onChange = (e) => {
    setMessage(e.target.value);
  };
  useEffect(() => {
    const fetchLandlord = async () => {
      try{
        const res = await fetch(`/api/user/${listing.userRef}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });
        const data = await res.json();
        setLandlord(data);
      }catch(err){
        console.log(err);
      }
    }
    fetchLandlord();
  }, [listing.userRef]);
  return (
    <>
    {landlord && (
      <div className='flex flex-col gap-2'>
        <p>Contact <span className='font-semibold'>{landlord.username}</span> for <span className='font-semibold'>{listing.name.toLowerCase()}</span></p>
        <textarea value={message} className='w-full border p-3 rounded-lg' onChange={onChange} placeholder='Enter your message here...' name='message' id='message' rows='2'></textarea>
      
        <Link
          to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`}
          className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:placeholder-opacity-95 text-center'
        >
          Send Message
        </Link>
      </div>
    )}
    </>
  )
}
