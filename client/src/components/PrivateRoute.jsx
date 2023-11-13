import React from 'react'
import { useContext } from 'react'
import { authContext } from '../../context/AuthContext'
import { Outlet, Navigate } from 'react-router-dom';

export default function PrivateRoute() {
    const { user } = useContext(authContext);
  return user ? <Outlet /> : <Navigate to='/sign-in'/>
}
