import { useEffect, useState, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import "@/App.css";
import axios from "axios";
import { ThemeProvider } from "@/components/ThemeProvider";
import { HealerMap } from "@/components/HealerMap";
import { HealerList } from "@/components/HealerList";
import { FilterBar } from "@/components/FilterBar";
import { AddHealerForm } from "@/components/AddHealerForm";
import { HealerProfileModal } from "@/components/HealerProfileModal";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "@/components/ui/sonner";
import { Moon, Sun, Sparkles, Download, Upload, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { LanguageProvider, useLanguage, languages } from "@/i18n/LanguageContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Lazy import xlsx only when exporting
const exportHealersToExcel = (healers) => {
  import('xlsx').then((XLSX) => {
    const rows = healers.map((h) => ({
      'ID': h.id,
      'Name': h.name,
      'Specialisation': h.specialisation,
      'Latitude': h.lat,
      'Longitude': h.lng,
      'Contact': h.contact || '',
      'Address': h.address || '',
      'Taluka': h.taluka || '',
      'District': h.district || '',
      'Pincode': h.pincode || '',
      'UID': h.uid || '',
      'Validity': h.validity || '',
      'Avg Rating': h.avg_rating || 0,
      'Rating Count': h.rating_count || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    // Auto-fit column widths
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String(r[key]).length)) + 2,
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Healers');
    XLSX.writeFile(wb, 'goa_healers.xlsx');
  });
};

function Header() {
  const { theme, setTheme } = useTheme();
  const { lang, changeLang, t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="bg-background/70 backdrop-blur-xl border-b border-emerald-200/30 dark:border-emerald-800/30 sticky top-0 z-50 shadow-sm" data-testid="header">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-lime-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 animate-float">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-lime-400 bg-clip-text text-transparent header-title">
            {t('app_title')}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLangOpen(!langOpen)}
              className="rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors btn-press"
              data-testid="lang-toggle"
            >
              <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </Button>
            {langOpen && ReactDOM.createPortal(
              <>
                {/* Backdrop to close on outside click */}
                <div className="fixed inset-0 z-[9998]" onClick={() => setLangOpen(false)} />
                {/* Dropdown rendered as fixed overlay */}
                <div className="fixed right-4 top-14 bg-background border border-emerald-200/40 dark:border-emerald-800/30 rounded-lg shadow-xl py-1 min-w-[140px] z-[9999] animate-slide-in">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { changeLang(l.code); setLangOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors ${lang === l.code ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50/50 dark:bg-emerald-900/10' : ''
                        }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </>,
              document.body
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="theme-toggle"
            className="rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors btn-press"
          >
            {theme === 'light' ? <Moon className="h-5 w-5 text-emerald-600" /> : <Sun className="h-5 w-5 text-yellow-400" />}
          </Button>
        </div>
      </div>
    </header>
  );
}

function MapView() {
  const [healers, setHealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHealer, setSelectedHealer] = useState(null);
  const [profileHealer, setProfileHealer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const { t } = useLanguage();
  const importInputRef = useRef(null);

  // Load healers data
  useEffect(() => {
    const loadHealers = async () => {
      try {
        const response = await axios.get(`${API}/healers`);
        const data = response.data;
        setHealers(data);
        toast.success(`${data.length} ${t('healers_found')}!`);
      } catch (error) {
        console.error('Error loading healers from API:', error);
        // Fallback to static file if API is unavailable
        try {
          const fallback = await fetch('/healers.json');
          const fallbackData = await fallback.json();
          setHealers(fallbackData);
          toast.info('Loaded healers from local file (API unavailable)');
        } catch (fallbackError) {
          toast.error('Failed to load healers data');
        }
      } finally {
        setLoading(false);
      }
    };

    loadHealers();
  }, []);

  // Test backend connection
  useEffect(() => {
    const testBackend = async () => {
      try {
        const response = await axios.get(`${API}/`);
        console.log("Backend connected:", response.data.message);
      } catch (e) {
        console.error("Backend connection error:", e);
      }
    };
    testBackend();
  }, []);

  // Filter healers based on search and specialty
  const filteredHealers = useMemo(() => {
    return healers.filter((healer) => {
      const matchesSearch = healer.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty =
        selectedSpecialty === 'all' ||
        healer.specialisation.toLowerCase().includes(selectedSpecialty.toLowerCase());
      return matchesSearch && matchesSpecialty;
    });
  }, [healers, searchTerm, selectedSpecialty]);

  const handleHealerSelect = (healer) => {
    setSelectedHealer(healer);
  };

  const handleRate = async (healerId, score) => {
    try {
      await axios.post(`${API}/healers/${healerId}/rate`, { score });
      toast.success(`Rated healer ${score} star${score !== 1 ? 's' : ''}!`);
      // Refresh healers to get updated aggregate
      const response = await axios.get(`${API}/healers`);
      setHealers(response.data);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  const handleAddHealer = async (healerData, photo) => {
    try {
      const res = await axios.post(`${API}/healers`, healerData);
      const newHealer = res.data;

      // Upload photo if provided
      if (photo && newHealer?.id) {
        try {
          const formData = new FormData();
          formData.append('file', photo);
          await axios.post(`${API}/healers/${newHealer.id}/photo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch (photoErr) {
          console.error('Photo upload failed:', photoErr);
          toast.error('Healer added but photo upload failed');
        }
      }

      toast.success(t('healer_added'));
      const response = await axios.get(`${API}/healers`);
      setHealers(response.data);
    } catch (error) {
      console.error('Error adding healer:', error);
      toast.error('Failed to add healer');
    }
  };

  const handleDeleteHealer = async (healerId) => {
    try {
      await axios.delete(`${API}/healers/${healerId}`);
      toast.success(t('healer_removed'));
      const response = await axios.get(`${API}/healers`);
      setHealers(response.data);
      if (selectedHealer?.id === healerId) setSelectedHealer(null);
    } catch (error) {
      console.error('Error deleting healer:', error);
      toast.error('Failed to remove healer');
    }
  };

  const handlePhotoUpload = async (healerId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`${API}/healers/${healerId}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(t('photo_uploaded'));
      const response = await axios.get(`${API}/healers`);
      setHealers(response.data);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    }
  };

  const handleVideoUpload = async (healerId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`${API}/healers/${healerId}/video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(t('video_uploaded'));
      const response = await axios.get(`${API}/healers`);
      setHealers(response.data);
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = ''; // reset so same file can be re-selected

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/healers/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { imported, errors } = response.data;
      toast.success(`${imported} ${t('healers_imported')}`);
      if (errors && errors.length > 0) {
        toast.warning(`${errors.length} rows skipped`);
      }
      // Refresh healer list
      const refreshed = await axios.get(`${API}/healers`);
      setHealers(refreshed.data);
    } catch (error) {
      const detail = error.response?.data?.detail || 'Import failed';
      toast.error(detail);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <div className="text-center space-y-5">
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 border-4 border-emerald-200 dark:border-emerald-800 rounded-full"></div>
            <div className="absolute top-0 w-20 h-20 border-4 border-transparent border-t-emerald-500 border-r-teal-500 rounded-full animate-spin"></div>
          </div>
          <div>
            <p className="text-lg font-medium text-foreground">{t('loading')}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('loading_sub')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col md:flex-row" data-testid="map-view">
      {/* Sidebar with filters and list */}
      <div className="w-full md:w-96 lg:w-[420px] flex flex-col border-r border-emerald-200/20 dark:border-emerald-800/20 bg-background/95 backdrop-blur-sm relative z-10">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSpecialty={selectedSpecialty}
          onSpecialtyChange={setSelectedSpecialty}
          healers={healers}
        />
        <div className="px-4 py-3 border-b border-emerald-200/20 dark:border-emerald-800/20 flex flex-wrap gap-2 bg-gradient-to-r from-emerald-50/30 to-teal-50/30 dark:from-emerald-950/10 dark:to-teal-950/10">
          {/* DISABLED FOR CLIENT DEMO — Add Healer & Import Excel
          <AddHealerForm onSubmit={handleAddHealer} />
          */}
          <Button
            variant="outline"
            className="shadow-sm border-emerald-200/40 dark:border-emerald-800/30 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all btn-press"
            onClick={() => {
              exportHealersToExcel(healers);
              toast.success(t('excel_downloaded'));
            }}
            data-testid="export-excel-button"
          >
            <Download className="w-4 h-4 mr-2 text-emerald-500" />
            {t('export_excel')}
          </Button>
          {/* DISABLED FOR CLIENT DEMO — Import Excel
          <Button
            variant="outline"
            className="shadow-sm border-emerald-200/40 dark:border-emerald-800/30 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all btn-press"
            onClick={() => importInputRef.current?.click()}
            data-testid="import-excel-button"
          >
            <Upload className="w-4 h-4 mr-2 text-emerald-500" />
            {t('import_excel')}
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportExcel}
            className="hidden"
          />
          */}
        </div>
        <div className="flex-1 overflow-hidden">
          <HealerList
            healers={filteredHealers}
            onHealerSelect={handleHealerSelect}
            selectedHealer={selectedHealer}
            onRate={handleRate}
            onDelete={handleDeleteHealer}
            onPhotoUpload={handlePhotoUpload}
            onVideoUpload={handleVideoUpload}
            onViewProfile={(healer) => { setProfileHealer(healer); setSelectedHealer(healer); }}
            backendUrl={BACKEND_URL}
          />
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 h-64 md:h-auto">
        <HealerMap
          healers={filteredHealers}
          selectedHealer={selectedHealer}
          onHealerSelect={handleHealerSelect}
          onRate={handleRate}
        />
      </div>

      {/* Healer Profile Modal */}
      <HealerProfileModal
        healer={profileHealer}
        open={!!profileHealer}
        onClose={() => setProfileHealer(null)}
        onRate={handleRate}
        onDelete={handleDeleteHealer}
        onPhotoUpload={handlePhotoUpload}
        onVideoUpload={handleVideoUpload}
        backendUrl={BACKEND_URL}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="goahealers-theme">
      <LanguageProvider>
        <div className="App min-h-screen bg-background">
          <Header />
          <MapView />
          <Toaster />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
