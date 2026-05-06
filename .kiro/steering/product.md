# Product: UST Lost and Found

A frontend-only prototype web app for the University of Santo Tomas (UST). Students can post lost or found items and browse a catalog of reported items.

## Key Characteristics
- Demo/prototype only — no real backend, no database, no real authentication
- All data lives in client-side Zustand state, seeded with mock data
- Login is fake: clicking either login button sets a hardcoded demo user and redirects

## Branding
- UST Gold: `#F5B731`
- UST Black: `#1A1A1A`
- Visual style: clean, card-based, rounded corners, subtle shadows (inspired by MyUSTe Portal)
- No emojis anywhere in the UI

## Privacy Rule
High-value lost items (categories: Electronics, Bags and Wallets, ID and Cards, Accessories, Documents) are anonymized in all public views:
- Title replaced with a generic label (e.g., "Lost electronic device")
- Description and image hidden
- "Protected" amber badge shown
- Detail page shows an amber notice block explaining private verification
- Found items are never anonymized
