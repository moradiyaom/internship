import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return ( 
        <nav className = "navbar" >
        <div className = "navbar-brand" >
        <Link to = { user ? "/dashboard" : "/" } > 🍽️Restaurant Management </Link> 
        </div > {
            user ? ( 
                <>
                <div className = "navbar-links" >
                {user.role === 'manager' && < Link to = "/dashboard" > Dashboard </Link>}
                <Link to = "/menu-management" > Menu </Link>
                <Link to = "/orders" > Orders </Link>
                {user.role === 'manager' && <Link to = "/tables" > Tables </Link>} 
                {user.role === 'manager' && <Link to = "/QRCode" > QRcode </Link>} 
                {user.role === 'manager' && <Link to = "/reservations" > Reservations </Link>}
                
                {user.role === 'manager' && < Link to = "/staff" > Staff </Link>}
                {/*
                {user.role === 'manager' && < Link to = "/download" > Download </Link>}
                */}  
                </div > 
                <div className = "navbar-user" >
                <span > Welcome, { user.name }({ user.role }) </span> 
                <button onClick = { handleLogout } > Logout </button> 
                </div > 
                </>
            ) : ( 
                <div className = "navbar-links" >
                <Link to = "/" > Home </Link> 
                <Link to = "/login" > Login </Link> 
                </div >
            )
        } 
        </nav>
    );
};

export default Navbar;
