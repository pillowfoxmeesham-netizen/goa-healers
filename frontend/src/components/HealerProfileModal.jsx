import React, { useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
    User, MapPin, Phone, MapPinned, Calendar, IdCard, Navigation, Trash2,
    Star, Camera, X, MessageCircle, ExternalLink,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { StarRating } from './StarRating';
import { useLanguage } from '../i18n/LanguageContext';

// Reuse the healer icon
const healerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export function HealerProfileModal({
    healer,
    open,
    onClose,
    onRate,
    onDelete,
    onPhotoUpload,
    backendUrl,
}) {
    const fileInputRef = useRef(null);
    const { t } = useLanguage();

    if (!healer) return null;

    const photoSrc = healer.photo_url
        ? `${backendUrl}${healer.photo_url}?t=${Date.now()}`
        : null;

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Photo must be under 5 MB');
                return;
            }
            onPhotoUpload(healer.id, file);
        }
        e.target.value = '';
    };

    const whatsappUrl = healer.contact
        ? `https://wa.me/91${healer.contact.replace(/\D/g, '').slice(-10)}`
        : null;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[92vh] overflow-y-auto p-0 gap-0 border-purple-200/30 dark:border-purple-800/30">
                <DialogDescription className="sr-only">
                    Detailed profile view for {healer.name}
                </DialogDescription>

                {/* Hero Section */}
                <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-6 pb-16">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors z-10"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>

                    {/* Top-rated badge */}
                    {healer.avg_rating >= 4 && (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-yellow-400/90 backdrop-blur-sm text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            Top Rated
                        </div>
                    )}

                    <DialogHeader className="pt-4">
                        <DialogTitle className="text-2xl font-bold text-white drop-shadow-md">
                            {healer.name}
                        </DialogTitle>
                    </DialogHeader>
                </div>

                {/* Photo — overlapping the hero */}
                <div className="flex justify-center -mt-12 mb-4 px-6 relative z-10">
                    <div className="relative group">
                        {photoSrc ? (
                            <img
                                src={photoSrc}
                                alt={healer.name}
                                className="w-24 h-24 rounded-2xl object-cover border-4 border-background shadow-xl"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center border-4 border-background shadow-xl">
                                <User className="w-10 h-10 text-white" />
                            </div>
                        )}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title="Upload photo"
                        >
                            <Camera className="w-6 h-6 text-white drop-shadow-lg" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 space-y-5">

                    {/* Specialisations */}
                    <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            {t('specialisations')}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {healer.specialisation.split(',').map((spec, idx) => (
                                <Badge
                                    key={idx}
                                    className="bg-purple-100/80 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-0 px-3 py-1"
                                >
                                    {spec.trim()}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Rating */}
                    <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            {t('rating')}
                        </h4>
                        <StarRating
                            healerId={healer.id}
                            avgRating={healer.avg_rating}
                            ratingCount={healer.rating_count}
                            onRate={onRate}
                            size="md"
                        />
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            {t('contact_info')}
                        </h4>
                        <div className="space-y-2.5">
                            {healer.contact && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <a href={`tel:${healer.contact}`} className="text-sm font-medium hover:text-purple-600 transition-colors">
                                            {healer.contact}
                                        </a>
                                    </div>
                                    {whatsappUrl && (
                                        <a
                                            href={whatsappUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                        >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            {t('whatsapp')}
                                        </a>
                                    )}
                                </div>
                            )}

                            {healer.address && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                        <MapPinned className="w-4 h-4 text-red-500 dark:text-red-400" />
                                    </div>
                                    <span className="text-sm text-muted-foreground pt-1">{healer.address}</span>
                                </div>
                            )}

                            {(healer.taluka || healer.district) && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {[healer.taluka, healer.district, healer.pincode].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                            )}

                            {healer.uid && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                        <IdCard className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                                    </div>
                                    <span className="text-sm text-muted-foreground font-mono">{healer.uid}</span>
                                </div>
                            )}

                            {healer.validity && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                                    </div>
                                    <span className="text-sm text-muted-foreground">{t('valid')}: {healer.validity}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mini Map */}
                    <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            {t('location')}
                        </h4>
                        <div className="rounded-xl overflow-hidden border border-purple-200/30 dark:border-purple-800/30 shadow-md h-[200px]">
                            <MapContainer
                                center={[healer.lat, healer.lng]}
                                zoom={14}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={false}
                                dragging={false}
                                scrollWheelZoom={false}
                                doubleClickZoom={false}
                                attributionControl={false}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[healer.lat, healer.lng]} icon={healerIcon} />
                            </MapContainer>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-1">
                        <Button
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md btn-press"
                            onClick={() => {
                                const url = `https://www.google.com/maps/dir/?api=1&destination=${healer.lat},${healer.lng}`;
                                window.open(url, '_blank');
                            }}
                        >
                            <Navigation className="w-4 h-4 mr-2" />
                            {t('get_directions')}
                        </Button>


                        <Button
                            variant="outline"
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:border-red-800 transition-colors btn-press"
                            onClick={() => {
                                if (window.confirm(`${t('confirm_delete')} "${healer.name}"?`)) {
                                    onDelete(healer.id);
                                    onClose();
                                }
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
