"use client"
import React from "react"
import PropTypes from 'prop-types'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ProfileInfo({ user, onLogout, onEdit }) {
    return (
        <Card className="w-full p-6 rounded-2xl shadow-sm">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Left: Avatar + Info */}
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-md font-regular text-foreground -ml-2">
                        {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                    </div>

                    {/* Basic Info */}
                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold text-foreground">{user.name}</h2>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                        <span className="text-xs font-medium text-green-600">{user.status}</span>
                    </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex gap-2 self-end lg:self-auto">
                    <Button variant="secondary" onClick={onEdit}>
                        Edit Profile
                    </Button>
                </div>
            </div>

            {/* Details */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Detail label="ID Number" value={user.idNumber} />
                <Detail label="Birth Place & Date" value={user.birthPlaceDate} />
                <Detail label="Gender" value={user.gender} />
                <Detail label="Address" value={user.address} />
                <Detail label="Whatsapp" value={user.whatsapp} />
                <Detail label="Education" value={user.education} />
                <Detail label="Occupation" value={user.occupation} />
            </div>
        </Card >
    )
}
// reusable sub-component
function Detail({ label, value }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-medium text-foreground">{value}</span>
        </div>
    )
}

Detail.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
};

ProfileInfo.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        email: PropTypes.string,
        status: PropTypes.string,
        idNumber: PropTypes.string,
        birthPlaceDate: PropTypes.string,
        gender: PropTypes.string,
        address: PropTypes.string,
        whatsapp: PropTypes.string,
        education: PropTypes.string,
        occupation: PropTypes.string
    }).isRequired,
    onEdit: PropTypes.func
};
