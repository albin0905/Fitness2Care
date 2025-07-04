import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../login/AuthPage.css";
import { useMemberContext } from "../../_common/context/MemberContext";
import {UserService} from "../../_components/services/UserService";

const Login = () => {
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        weight: "",
    });

    const navigate = useNavigate();
    const { setMember } = useMemberContext();

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async () => {
        try {
            const member = await UserService.login(form.email, form.password);
            setMember(member);
            navigate("/dashboard");
        } catch (err) {
            setError("Falsche Anmeldeinformationen");
        }
    };

    const handleRegister = async () => {
        try {
            const member = await UserService.register({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                password: form.password,
                phone: form.phone,
                weight: parseInt(form.weight, 10),
            });
            setMember(member);
            navigate("/dashboard");
        } catch (err) {
            setError("Registrierung fehlgeschlagen");
        }
    };

    const handleSubmit = () => {
        setError("");
        isRegisterMode ? handleRegister() : handleLogin();
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <div className="card p-4 shadow" style={{ width: "400px" }}>
                    <h3 className="text-center mb-3">
                        {isRegisterMode ? "Registrieren" : "Login"}
                    </h3>
                    {error && <div className="alert alert-danger">{error}</div>}

                    {isRegisterMode && (
                        <>
                            <div className="mb-2">
                                <label className="form-label">Vorname</label>
                                <input
                                    type="text"
                                    placeholder="Max"
                                    className="form-control"
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-2">
                                <label className="form-label">Nachname</label>
                                <input
                                    type="text"
                                    placeholder="Mustermann"
                                    className="form-control"
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-2">
                                <label className="form-label">Telefon</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="phone"
                                    placeholder="0123456789"
                                    value={form.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-2">
                                <label className="form-label">Gewicht (kg)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="weight"
                                    placeholder="80"
                                    value={form.weight}
                                    onChange={handleChange}
                                />
                            </div>
                        </>
                    )}

                    <div className="mb-2">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            name="email"
                            placeholder="max.musterman@gmail.com"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Passwort</label>
                        <input
                            type="password"
                            className="form-control"
                            name="password"
                            placeholder="********"
                            value={form.password}
                            onChange={handleChange}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        />
                    </div>

                    <button className="btn btn-primary w-100 mb-2" onClick={handleSubmit}>
                        {isRegisterMode ? "Registrieren" : "Login"}
                    </button>
                    <button
                        className="btn btn-link w-100"
                        onClick={() => {
                            setIsRegisterMode(!isRegisterMode);
                            setError("");
                        }}
                    >
                        {isRegisterMode ? "Zum Login wechseln" : "Jetzt registrieren"}
                    </button>
                </div>
            </div>

            <div className="auth-image">
                {!isRegisterMode ? (
                    <>
                        <h2>Neu hier?</h2>
                        <p>Jetzt registrieren und neue Möglichkeiten entdecken!</p>
                        <button
                            className="btn btn-light"
                            onClick={() => {
                                setIsRegisterMode(true);
                                setError("");
                            }}
                        >
                            Registrieren
                        </button>
                    </>
                ) : (
                    <>
                        <h2>Willkommen zurück!</h2>
                        <p>Du hast schon einen Account?</p>
                        <button
                            className="btn btn-light"
                            onClick={() => {
                                setIsRegisterMode(false);
                                setError("");
                            }}
                        >
                            Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;
