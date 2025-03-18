import React, { useState } from "react";
import { useMemberContext } from "../../_common/context/MemberContext";

const UserAccount = () => {
    const { member, setMember } = useMemberContext();

    const [formData, setFormData] = useState({
        firstName: member?.firstName || "",
        lastName: member?.lastName || "",
        email: member?.email || "",
        phone: member?.phone || 0,
        weight: member?.weight || 0
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        if (!member) return;

        setMember({
            id: member.id, // Sicherstellen, dass ID bleibt
            password: member.password, // Falls notwendig
            ...formData
        });
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

                <button type="button" className="btn btn-primary" onClick={handleSave}>Speichern</button>
            </form>
        </div>
    );
};

export default UserAccount;
