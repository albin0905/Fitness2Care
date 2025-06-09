import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useMemberContext } from "../../_common/context/MemberContext";
import LogoutIcon from '@mui/icons-material/Logout';
import { AccountCircle } from "@mui/icons-material";
import { useLanguage } from "../../_common/context/LanguageContext";

const MenuBar = () => {
    const { member } = useMemberContext();
    const navigate = useNavigate();
    const location = useLocation();
    const { language, setLanguage, texts } = useLanguage();

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="bg-white text-dark vh-100 p-3 shadow d-flex flex-column align-items-center"
             style={{ width: "250px", position: "fixed", left: 0, top: 0 }}>

            <div className="text-center mb-3">
                <img
                    src="/Fitness2Care_Logo.png"
                    alt="Logo"
                    onClick={() => navigate("/dashboard")}
                    className="img-fluid"
                    style={{ maxWidth: "190px", height: "auto" }}
                />
            </div>

            <div className="mb-3 w-100">
                <label htmlFor="languageSelect" className="form-label text-center w-100 fw-bold"> </label>
                <select
                    id="languageSelect"
                    className="form-select text-center"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'de' | 'en')}
                >
                    <option value="de"> Deutsch</option>
                    <option value="en"> English</option>
                </select>
            </div>

            <ul className="nav flex-column w-100 text-center flex-grow-1">
                <li className="nav-item">
                    <Link className={`nav-link text-dark fs-5 ${location.pathname === "/dashboard" ? "fw-bold" : ""}`} to="/dashboard">
                        {texts.dashboard}
                    </Link>
                    <Link className={`nav-link text-dark fs-5 ${location.pathname === "/workout" ? "fw-bold" : ""}`} to="/workout">
                        {texts.workout}
                    </Link>
                    <Link className={`nav-link text-dark fs-5 ${location.pathname === "/progress" ? "fw-bold" : ""}`} to="/progress">
                        {texts.progress}
                    </Link>
                    <Link className={`nav-link text-dark fs-5 ${location.pathname === "/goal" ? "fw-bold" : ""}`} to="/goal">
                        {texts.goal}
                    </Link>
                    <Link className={`nav-link text-dark fs-5 ${location.pathname === "/calorietracker" ? "fw-bold" : ""}`} to="/calorietracker">
                        {texts.calorieTracker}
                    </Link>
                </li>
            </ul>

            <Link className={`nav-link text-dark fs-5 mb-3`} to="/account">
                <AccountCircle /> {member?.firstName} {member?.lastName}
            </Link>

            <button className="btn btn-outline-danger" onClick={handleLogout}>
                <LogoutIcon /> {texts.logout}
            </button>
        </div>
    );
};

export default MenuBar;
