import React, { useState } from "react";
import { useMemberContext } from "../../_common/context/MemberContext";
import axios from "axios";

const UserAccount = () => {
    const { member, setMember } = useMemberContext();

    const [formData, setFormData] = useState({
        firstName: member?.firstName || "",
        lastName: member?.lastName || "",
        email: member?.email || "",
        phone: member?.phone || 0,
        weight: member?.weight || 0,
        password: member?.phone || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!member) return;

        const updatedMember = {
            memberId: member.memberId, // wichtig: memberId, nicht id!
            ...formData,
        };

        console.log("Updated member:", updatedMember);

        try {
            const response = await axios.put(
                `http://localhost:8080/member/${member.memberId}`,
                updatedMember,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            setMember(response.data);
            alert("Daten erfolgreich gespeichert!");
        } catch (error: any) {
            if (error.response) {
                console.error("Fehler vom Server:", error.response.data);
                alert("Fehler vom Server: " + JSON.stringify(error.response.data));
            } else if (error.request) {
                console.error("Keine Antwort:", error.request);
                alert("Keine Antwort vom Server erhalten.");
            } else {
                console.error("Unbekannter Fehler:", error.message);
                alert("Fehler: " + error.message);
            }
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Benutzereinstellungen</h2>
            <form>
                <div className="mb-3">
                    <label className="form-label">Vorname</label>
                    <input type="text" name="firstName" className="form-control" value={formData.firstName} onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Nachname</label>
                    <input type="text" name="lastName" className="form-control" value={formData.lastName} onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label">E-Mail</label>
                    <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Telefon</label>
                    <input type="number" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Gewicht</label>
                    <input type="number" name="weight" className="form-control" value={formData.weight} onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Passwort ändern</label>
                    <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} />
                </div>

                <button type="button" className="btn btn-primary" onClick={handleSave}>Speichern</button>
            </form>
        </div>
    );
};

export default UserAccount;
