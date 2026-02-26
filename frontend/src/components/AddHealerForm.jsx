import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Plus, UserPlus, MapPin, Phone, FileText, Camera, X } from 'lucide-react';

const initialForm = {
    name: '',
    specialisation: '',
    lat: '',
    lng: '',
    contact: '',
    address: '',
    taluka: '',
    district: '',
    pincode: '',
    uid: '',
    validity: '',
};

const inputClasses =
    'flex h-9 w-full rounded-md border border-purple-200/40 dark:border-purple-800/30 bg-transparent px-3 py-1 text-sm shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/30 focus-visible:border-purple-400';

export function AddHealerForm({ onSubmit }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Photo must be under 5 MB');
                return;
            }
            setPhoto(file);
            const reader = new FileReader();
            reader.onload = (ev) => setPhotoPreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const clearPhoto = () => {
        setPhoto(null);
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.specialisation || !form.lat || !form.lng) return;

        setSubmitting(true);
        try {
            const payload = {
                ...form,
                lat: parseFloat(form.lat),
                lng: parseFloat(form.lng),
            };
            // Remove empty optional fields
            Object.keys(payload).forEach((key) => {
                if (payload[key] === '') delete payload[key];
            });

            await onSubmit(payload, photo);
            setForm(initialForm);
            clearPhoto();
            setOpen(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md btn-press"
                    data-testid="add-healer-button"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Healer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <UserPlus className="w-5 h-5 text-purple-500" />
                        Add New Healer
                    </DialogTitle>
                    <DialogDescription>
                        Fill in the healer's details below. Fields marked * are required.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Photo Upload */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <Camera className="w-3.5 h-3.5" /> Photo
                        </h4>
                        <div className="flex items-center gap-4">
                            {photoPreview ? (
                                <div className="relative">
                                    <img
                                        src={photoPreview}
                                        alt="Preview"
                                        className="w-20 h-20 rounded-xl object-cover border-2 border-purple-200 dark:border-purple-800 shadow-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={clearPhoto}
                                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-20 h-20 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-700 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all"
                                >
                                    <Camera className="w-6 h-6 text-purple-400" />
                                    <span className="text-[10px] text-muted-foreground mt-1">Add Photo</span>
                                </div>
                            )}
                            <div className="flex-1">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs border-purple-200/40 dark:border-purple-800/30"
                                >
                                    <Camera className="w-3.5 h-3.5 mr-1.5" />
                                    {photo ? 'Change Photo' : 'Choose Photo'}
                                </Button>
                                <p className="text-xs text-muted-foreground mt-1">
                                    JPG, PNG, WebP or GIF. Max 5 MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5" /> Basic Information
                        </h4>
                        <div className="space-y-1">
                            <label htmlFor="name" className="text-sm font-medium">Name *</label>
                            <input
                                id="name"
                                className={inputClasses}
                                placeholder="e.g. Pandhari Navaso Arolkar"
                                value={form.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="specialisation" className="text-sm font-medium">Specialisation(s) *</label>
                            <input
                                id="specialisation"
                                className={inputClasses}
                                placeholder="e.g. Common Ailments, Jaundice, Poison Bites"
                                value={form.specialisation}
                                onChange={(e) => handleChange('specialisation', e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">Separate multiple specialisations with commas</p>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" /> Location
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label htmlFor="lat" className="text-sm font-medium">Latitude *</label>
                                <input
                                    id="lat"
                                    type="number"
                                    step="any"
                                    className={inputClasses}
                                    placeholder="e.g. 15.7016"
                                    value={form.lat}
                                    onChange={(e) => handleChange('lat', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="lng" className="text-sm font-medium">Longitude *</label>
                                <input
                                    id="lng"
                                    type="number"
                                    step="any"
                                    className={inputClasses}
                                    placeholder="e.g. 73.7701"
                                    value={form.lng}
                                    onChange={(e) => handleChange('lng', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="address" className="text-sm font-medium">Address</label>
                            <input
                                id="address"
                                className={inputClasses}
                                placeholder="Full address"
                                value={form.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label htmlFor="taluka" className="text-sm font-medium">Taluka</label>
                                <input
                                    id="taluka"
                                    className={inputClasses}
                                    placeholder="Taluka"
                                    value={form.taluka}
                                    onChange={(e) => handleChange('taluka', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="district" className="text-sm font-medium">District</label>
                                <input
                                    id="district"
                                    className={inputClasses}
                                    placeholder="District"
                                    value={form.district}
                                    onChange={(e) => handleChange('district', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="pincode" className="text-sm font-medium">Pincode</label>
                                <input
                                    id="pincode"
                                    className={inputClasses}
                                    placeholder="403001"
                                    value={form.pincode}
                                    onChange={(e) => handleChange('pincode', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact & ID */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5" /> Contact & Identification
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label htmlFor="contact" className="text-sm font-medium">Contact Number</label>
                                <input
                                    id="contact"
                                    className={inputClasses}
                                    placeholder="Phone number"
                                    value={form.contact}
                                    onChange={(e) => handleChange('contact', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="uid" className="text-sm font-medium">UID</label>
                                <input
                                    id="uid"
                                    className={inputClasses}
                                    placeholder="Unique ID"
                                    value={form.uid}
                                    onChange={(e) => handleChange('uid', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="validity" className="text-sm font-medium">Validity Period</label>
                            <input
                                id="validity"
                                className={inputClasses}
                                placeholder="e.g. 2024-2026"
                                value={form.validity}
                                onChange={(e) => handleChange('validity', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting || !form.name || !form.specialisation || !form.lat || !form.lng}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                            {submitting ? 'Adding...' : 'Add Healer'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
