# Routing Services

This directory contains services for dynamic route calculation.

## Overview

The application now supports **two types of routes**:

1. **Curated Routes** - Hand-crafted routes stored in the database with POIs, accommodations, etc.
2. **Dynamic Routes** - Automatically calculated routes for any city pair using OpenRouteService

## How It Works

When a user requests a route from City A to City B:

1. **First**, the system checks the database for a curated route
2. **If not found**, it falls back to dynamic calculation using:
   - **Geocoding** (Nominatim) - converts city names to coordinates
   - **Routing** (OpenRouteService) - calculates the actual route
   - **Segmentation** - breaks long routes into daily rides (~400km each)

## Files

### `geocoding.ts`
- Converts city names to coordinates (geocoding)
- Converts coordinates to city names (reverse geocoding)
- Uses Nominatim (free, no API key needed)

### `routing.ts`
- Calculates routes between coordinates
- Uses OpenRouteService API
- Requires API key (free tier: 2,000 requests/day)
- Supports preferences (scenic routes, avoid highways)

### `dynamicRoute.ts`
- Orchestrates geocoding + routing
- Creates route segments for multi-day trips
- Returns data in the same format as curated routes

## Setup

### 1. Get API Key

Sign up at https://openrouteservice.org/dev/ (free, no credit card)

### 2. Add to .env

```env
OPENROUTESERVICE_API_KEY=your_actual_key_here
```

### 3. Restart Server

```bash
npm run dev
```

## Testing

Run the test script:

```bash
node test-dynamic-routing.mjs
```

This will test:
- Prague → Rome (curated route from database)
- Prague → Istanbul (dynamic calculation)
- Berlin → Athens (dynamic calculation)
- Paris → Vienna (dynamic calculation)

## API Limits

### OpenRouteService Free Tier
- 2,000 requests/day
- 40 requests/minute
- No credit card required

### Nominatim (Geocoding)
- 1 request/second
- No API key needed
- Must include User-Agent header

## Features

### Supported
✅ Route calculation between any two cities
✅ Multi-day trip segmentation
✅ Scenic route preference
✅ Avoid highways option
✅ Distance and duration estimates

### Not Yet Implemented
❌ POIs along dynamic routes
❌ Accommodation suggestions
❌ Ferry route detection
❌ Custom waypoints for dynamic routes
❌ Route caching/saving

## Error Handling

The system gracefully degrades:
- No API key → Only curated routes work
- Invalid city name → Returns 404 with helpful message
- API rate limit → Returns error with explanation
- Network error → Falls back to error message

## Future Improvements

1. **Cache dynamic routes** - Save calculated routes to reduce API calls
2. **POI discovery** - Use Overpass API to find points of interest along route
3. **Accommodation search** - Integrate with booking APIs
4. **Custom waypoints** - Allow users to add intermediate stops
5. **Route optimization** - Optimize for scenic roads, twisty routes, etc.
