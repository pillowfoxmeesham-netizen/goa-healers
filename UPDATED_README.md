# Goa Healers Map - Updated Version

## 🎉 What's New in This Version

### **Features Included:**

✅ **Map Clustering** - Markers group when zoomed out  
✅ **Get Directions** - One-click navigation to Google Maps  
✅ **Complete Contact Details** - Phone, address, UID, validity  
✅ **Search & Filter** - Find healers by name and specialization  
✅ **Dark/Light Mode** - Theme toggle with persistence  
✅ **Click-to-Call** - Tap phone numbers to call  
✅ **Responsive Design** - Works on all devices  
✅ **Interactive Map** - Leaflet with OpenStreetMap  

### **Removed:**
❌ QR Code feature (as requested)

---

## 📦 What's in the Zip

```
goa-healers-updated.zip
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HealerMap.jsx (with clustering & directions)
│   │   │   ├── HealerList.jsx (with contact details)
│   │   │   ├── FilterBar.jsx
│   │   │   ├── ThemeProvider.jsx
│   │   │   └── ui/ (all shadcn components)
│   │   ├── App.js (main app with theme support)
│   │   ├── App.css (custom animations)
│   │   └── index.css (Leaflet + Tailwind)
│   ├── public/
│   │   ├── healers.json (3 sample healers)
│   │   └── healers_complete.json (30 healers from Excel)
│   └── package.json (all dependencies)
├── backend/
│   ├── server.py
│   └── requirements.txt
```

---

## 🚀 Setup Instructions

### **1. Extract the Zip**
```bash
unzip goa-healers-updated.zip
cd goa-healers-updated
```

### **2. Frontend Setup**
```bash
cd frontend
yarn install
```

Create `.env` file:
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

Start frontend:
```bash
yarn start
```

### **3. Backend Setup (Optional)**
```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=goahealers
CORS_ORIGINS=http://localhost:3000
```

Start backend:
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

---

## 📱 Current Features

### **Map Features:**
- Interactive Leaflet map with OpenStreetMap
- Marker clustering (groups nearby healers)
- Click markers to see healer details
- Auto-zoom to selected healer
- Get Directions button in popups

### **Healer Information:**
- Name & Specializations
- Phone number (click-to-call)
- Full address
- Taluka, District, Pincode
- UID Number
- Certificate Validity
- Coordinates

### **Search & Filter:**
- Search by healer name
- Filter by specialization
- Real-time results
- Active filter badges

### **UI/UX:**
- Dark/Light mode toggle
- Responsive design
- Color-coded icons
- Smooth animations
- Professional layout

---

## 🎨 Color Scheme

- **Primary**: Purple to Pink gradient
- **Icons**: 
  - 📞 Green (Phone)
  - 📍 Red (Address)
  - 📌 Blue (Location)
  - 🆔 Purple (UID)
  - 📅 Orange (Validity)

---

## 📊 Data Files

### **healers.json** (Currently Active)
- 3 sample healers
- Has coordinates
- Ready to use

### **healers_complete.json** (From Your Excel)
- 30 healers
- All contact details included
- Default coordinates (need updating)

**To use the complete data:**
Replace `healers.json` with `healers_complete.json` in `public/` folder

---

## 🔧 Tech Stack

**Frontend:**
- React 19
- Leaflet & react-leaflet
- react-leaflet-cluster
- shadcn/ui components
- Tailwind CSS
- Axios

**Backend:**
- FastAPI
- MongoDB
- Python 3.8+

---

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

---

## 📝 Notes

- Frontend works standalone without backend
- Map data loads from `healers.json`
- All features work client-side
- No database required for basic functionality
- localStorage used for custom healers (if added via form)

---

## 🎯 Next Steps (Optional)

1. Update coordinates in `healers_complete.json`
2. Add more healer details as needed
3. Deploy to production
4. Add authentication (if needed)
5. Implement booking system (future enhancement)

---

## 📞 Support

If you need help or have questions:
- Check console logs for errors
- Verify all dependencies installed
- Ensure ports 3000 and 8001 are free
- Clear browser cache if issues persist

---

## ✨ Enjoy Your Healer Map Application!

**Live Preview:** https://better-react.preview.emergentagent.com

Built with ❤️ for Goa Healers
