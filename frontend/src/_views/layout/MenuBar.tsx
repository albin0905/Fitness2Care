import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useMemberContext } from "../../_common/context/MemberContext";
import LogoutIcon from '@mui/icons-material/Logout';
import { AccountCircle } from "@mui/icons-material";

const MenuBar = () => {
    const { member, setMember } = useMemberContext();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="bg-white text-dark vh-100 p-3 shadow d-flex flex-column align-items-center"
             style={{ width: "250px", position: "fixed", left: 0, top: 0 }}>

            {/* Logo */}
            <div className="text-center mb-4">
                <img
                    src="/Fitness2Care_Logo.png"
                    alt="Logo"
                    className="img-fluid"
                    style={{ maxWidth: "190px", height: "auto" }}
                />
            </div>

            {/* Navigation */}
            <ul className="nav flex-column w-100 text-center flex-grow-1">
                <li className="nav-item">
                    <Link
                        className={`nav-link text-dark fs-5 ${location.pathname === "/dashboard" ? "fw-bold" : ""}`}
                        to="/dashboard"
                    >
                        Dashboard
                    </Link>
                    <Link
                        className={`nav-link text-dark fs-5 ${location.pathname === "/workout" ? "fw-bold" : ""}`}
                        to="/workout"
                    >
                        Workout
                    </Link>
                    <Link
                        className={`nav-link text-dark fs-5 ${location.pathname === "/progress" ? "fw-bold" : ""}`}
                        to="/progress"
                    >
                        Fortschritt
                    </Link>
                    <Link
                        className={`nav-link text-dark fs-5 ${location.pathname === "/goal" ? "fw-bold" : ""}`}
                        to="/goal"
                    >
                        Ziel
                    </Link>
                    <Link
                        className={`nav-link text-dark fs-5 ${location.pathname === "/calorietracker" ? "fw-bold" : ""}`}
                        to="/calorietracker"
                    >
                        Kalorientracker
                    </Link>
                </li>
            </ul>

            <Link
                className={`nav-link text-dark fs-5 mb-3 ${location.pathname === "/account" ? "fw-bold" : ""}`}
                to="/account"
            >
                <AccountCircle /> {member?.firstName} {member?.lastName}
            </Link>

            <button className="btn btn-outline-danger" onClick={handleLogout}>
                <LogoutIcon /> Abmelden
            </button>
        </div>
    );
};

export default MenuBar;
