# Google Maps Setup for Nashik World

## Prerequisites

1. A Google Cloud Platform account
2. A Google Maps API key

## Setup Instructions

### 1. Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API (optional, for enhanced functionality)
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" → "API Key"
6. Copy your API key

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory of your project and add:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 3. Restrict Your API Key (Recommended)

For security, restrict your API key:

1. In Google Cloud Console, go to "Credentials"
2. Click on your API key
3. Under "Application restrictions", select "HTTP referrers (web sites)"
4. Add your domain (e.g., `localhost:3000/*` for development)
5. Under "API restrictions", select "Restrict key"
6. Select only the APIs you need (Maps JavaScript API, Places API)

### 4. Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the home page
3. You should see the Google Maps with Nashik civic issues

## Features

The Google Maps integration includes:

- **Nashik-specific centering**: Map is centered on Nashik city (19.9975°N, 73.7898°E)
- **Custom markers**: Different colored markers for different issue types
- **Interactive info windows**: Click markers to see issue details
- **Filtering**: Filter issues by type, status, and urgency
- **Real-time updates**: Markers update based on filtered data
- **Responsive design**: Works on mobile and desktop

## Issue Types and Colors

- 🕳️ Potholes: Orange
- 💧 Water Leaks: Blue
- 🗑️ Garbage: Green
- 🌳 Fallen Trees: Red
- 💡 Street Lights: Yellow
- ⚠️ Disasters: Purple
- ✅ Resolved Issues: Green (regardless of type)

## Troubleshooting

### Map not loading
- Check if your API key is correct
- Ensure the Maps JavaScript API is enabled
- Check browser console for errors

### Markers not showing
- Verify that your issue data has valid coordinates
- Check if the coordinates are within reasonable bounds for Nashik

### Performance issues
- Consider implementing marker clustering for large datasets
- Optimize marker rendering by limiting the number of visible markers

## Next Steps

1. Replace sample data with real Firebase data
2. Add marker clustering for better performance
3. Implement real-time location updates
4. Add street view integration
5. Implement directions to issues 