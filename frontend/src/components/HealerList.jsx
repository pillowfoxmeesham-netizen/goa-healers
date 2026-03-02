import React, { useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { User, MapPin, Sparkles, Navigation, Phone, MapPinned, Calendar, IdCard, Trash2, Star, Camera, Eye, Video } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { StarRating } from './StarRating';
import { useLanguage } from '../i18n/LanguageContext';

export function HealerList({ healers, onHealerSelect, selectedHealer, onRate, onDelete, onPhotoUpload, onVideoUpload, onViewProfile, backendUrl }) {
  const { t } = useLanguage();
  if (healers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center" data-testid="no-healers-message">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-4">
          <Sparkles className="w-10 h-10 text-emerald-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{t('no_healers')}</h3>
        <p className="text-muted-foreground text-sm">{t('no_healers_sub')}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" data-testid="healer-list">
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold" data-testid="healer-count">
              {healers.length} {t('healers_found')}
            </h2>
          </div>
          <div className="stats-badge px-3 py-1 rounded-full">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              {healers.filter(h => h.avg_rating > 0).length} {t('rated')}
            </span>
          </div>
        </div>
        {healers.map((healer, index) => (
          <HealerCard
            key={healer.id}
            healer={healer}
            index={index}
            selected={selectedHealer?.id === healer.id}
            onSelect={onHealerSelect}
            onRate={onRate}
            onDelete={onDelete}
            onPhotoUpload={onPhotoUpload}
            onVideoUpload={onVideoUpload}
            onViewProfile={onViewProfile}
            backendUrl={backendUrl}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

function HealerCard({ healer, index, selected, onSelect, onRate, onDelete, onPhotoUpload, onVideoUpload, onViewProfile, backendUrl }) {
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const { t } = useLanguage();

  const handlePhotoClick = (e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo must be under 5 MB');
        return;
      }
      onPhotoUpload(healer.id, file);
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('Video must be under 50 MB');
        return;
      }
      onVideoUpload(healer.id, file);
    }
    e.target.value = '';
  };

  const photoSrc = healer.photo_url
    ? `${backendUrl}${healer.photo_url}?t=${Date.now()}`
    : null;

  return (
    <Card
      className={`healer-card cursor-pointer animate-slide-in border-l-4 ${selected
        ? 'border-l-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/30 animate-pulse-glow'
        : 'border-l-transparent hover:border-l-emerald-300'
        }`}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => onSelect(healer)}
      data-testid={`healer-card-${healer.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar / Photo */}
          <div className="relative group">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt={healer.name}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-md shadow-emerald-500/20 border-2 border-emerald-200/50 dark:border-emerald-800/50"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-lime-400 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
            {healer.avg_rating >= 4 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                <Star className="w-2.5 h-2.5 text-yellow-800 fill-current" />
              </div>
            )}
            {/* Photo upload overlay */}
            <button
              onClick={handlePhotoClick}
              className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              title="Upload photo"
            >
              <Camera className="w-5 h-5 text-white drop-shadow-lg" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-2 truncate" data-testid={`healer-name-${healer.id}`}>
              {healer.name}
            </h3>
            <div className="space-y-2">
              {/* Specializations */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t('specialisations')}:</p>
                <div className="flex flex-wrap gap-1">
                  {healer.specialisation.split(',').map((spec, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-xs bg-emerald-100/60 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0"
                      data-testid={`spec-${healer.id}-${idx}`}
                    >
                      {spec.trim()}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="pt-1">
                <StarRating
                  healerId={healer.id}
                  avgRating={healer.avg_rating}
                  ratingCount={healer.rating_count}
                  onRate={onRate}
                  size="sm"
                />
              </div>

              {/* Contact Details Section */}
              <div className="pt-2 space-y-1.5">
                {healer.contact && (
                  <div className="flex items-start gap-2 text-xs">
                    <Phone className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <a href={`tel:${healer.contact}`} className="text-foreground hover:text-emerald-600 hover:underline break-all transition-colors">
                      {healer.contact}
                    </a>
                  </div>
                )}

                {healer.address && (
                  <div className="flex items-start gap-2 text-xs">
                    <MapPinned className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground line-clamp-2" title={healer.address}>
                      {healer.address}
                    </span>
                  </div>
                )}

                {(healer.taluka || healer.district) && (
                  <div className="flex items-start gap-2 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {[healer.taluka, healer.district, healer.pincode].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {healer.uid && (
                  <div className="flex items-start gap-2 text-xs">
                    <IdCard className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground font-mono">
                      {healer.uid}
                    </span>
                  </div>
                )}

                {healer.validity && (
                  <div className="flex items-start gap-2 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Valid: {healer.validity}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md shadow-emerald-500/20 btn-press"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile(healer);
                }}
                data-testid={`view-profile-${healer.id}`}
              >
                <Eye className="w-4 h-4 mr-2" />
                {t('view_profile')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="btn-press hover:border-emerald-300 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${healer.lat},${healer.lng}`;
                  window.open(url, '_blank');
                }}
                data-testid={`get-directions-${healer.id}`}
              >
                <Navigation className="w-4 h-4" />
              </Button>
              {/* DISABLED FOR CLIENT DEMO — Delete button
              <Button
                size="sm"
                variant="outline"
                className="text-red-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:border-red-800 transition-colors btn-press"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`${t('confirm_delete')} "${healer.name}"?`)) {
                    onDelete(healer.id);
                  }
                }}
                data-testid={`remove-healer-${healer.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              */}
              <Button
                size="sm"
                variant="outline"
                className="btn-press hover:border-emerald-300 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  videoInputRef.current?.click();
                }}
                title={t('upload_video')}
                data-testid={`upload-video-${healer.id}`}
              >
                <Video className="w-4 h-4" />
              </Button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                onChange={handleVideoChange}
                className="hidden"
              />
            </div>
            {healer.video_url && (
              <div className="mt-2">
                <a
                  href={`${backendUrl}${healer.video_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  data-testid={`watch-video-${healer.id}`}
                >
                  <Video className="w-3.5 h-3.5" />
                  {t('watch_video')}
                </a>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}