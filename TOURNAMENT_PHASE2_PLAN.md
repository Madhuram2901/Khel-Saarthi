# Tournament Module - Phase 2 Implementation Plan

## Overview
Implementing advanced features for the tournament module while ensuring nothing breaks.

---

## Features to Implement

### 1. ✅ Team Logo Upload & Display
**Status**: Backend Ready | Frontend Pending

**Backend** (Already Complete):
- ✅ Team model has `logoUrl` field
- ✅ `updateTeam` endpoint created: `PUT /api/tournaments/:tournamentId/teams/:teamId`
- ✅ Cloudinary integration exists
- ✅ All queries populate `logoUrl`

**Frontend** (To Implement):
- [ ] Add logo upload in ManageTeamsScreen
- [ ] Display logos in team cards
- [ ] Display logos in match cards
- [ ] Display logos in standings table
- [ ] Image picker component
- [ ] Upload to Cloudinary from frontend

**Implementation Steps**:
1. Install `expo-image-picker` for React Native
2. Create image upload utility
3. Add "Upload Logo" button in ManageTeamsScreen
4. Update team card components to show logos
5. Update match cards to show team logos
6. Update standings to show team logos

---

### 2. ✅ Bracket Visualization
**Status**: Design Phase

**What to Build**:
- Visual tree/bracket view for knockout tournaments
- Show match progression
- Highlight completed matches
- Show TBD for future matches
- Responsive design

**Components to Create**:
- `BracketView.js` - Main bracket component
- `BracketMatch.js` - Individual match in bracket
- `BracketRound.js` - Round container

**Implementation Approach**:
- Use SVG or Canvas for bracket lines
- Calculate positions dynamically based on rounds
- Support different bracket sizes (4, 8, 16, 32 teams)
- Handle byes visually

**Integration**:
- Add "Bracket View" tab in TournamentDashboardScreen (knockout only)
- Toggle between list view and bracket view

---

### 3. ✅ Public Tournament Pages
**Status**: Backend Partial | Frontend Pending

**Backend** (To Enhance):
- ✅ `isPublic` field exists
- ✅ Public tournaments visible in list
- [ ] Add public URL slug/code for sharing
- [ ] Add endpoint: `GET /api/tournaments/public/:slug`

**Frontend** (To Implement):
- [ ] PublicTournamentViewScreen
- [ ] Share button with link
- [ ] QR code generation (optional)
- [ ] Public view (no edit permissions)

**Features**:
- Shareable link: `khelsaarthi.com/tournament/ABC123`
- View-only mode for non-hosts
- Show all public information
- No edit/delete buttons for viewers

**Implementation Steps**:
1. Add `slug` field to Tournament model
2. Generate unique slug on creation
3. Create public view endpoint
4. Create PublicTournamentViewScreen
5. Add share functionality
6. Add copy link button

---

### 4. ✅ Notifications System
**Status**: Design Phase

**Types of Notifications**:
- Match scheduled
- Match result entered
- Tournament published
- Team added/removed
- Winner advanced

**Implementation Approach**:
**Simple Version** (Phase 2):
- In-app notifications only
- Store in database
- Show in app header
- Mark as read/unread

**Backend**:
- Create Notification model
- Create notification endpoints
- Trigger notifications on events

**Frontend**:
- Notification bell icon
- Notification list screen
- Badge count
- Mark as read

**Future** (Phase 3):
- Email notifications
- SMS notifications
- Push notifications

---

## Implementation Order

### Week 1: Team Logos
1. Day 1-2: Frontend image picker & upload
2. Day 3: Display logos in all components
3. Day 4: Testing & polish

### Week 2: Bracket Visualization
1. Day 1-2: Bracket layout algorithm
2. Day 3-4: Bracket UI components
3. Day 5: Integration & testing

### Week 3: Public Pages
1. Day 1: Backend slug system
2. Day 2-3: Public view screen
3. Day 4: Share functionality
4. Day 5: Testing

### Week 4: Notifications
1. Day 1-2: Backend notification system
2. Day 3-4: Frontend notification UI
3. Day 5: Integration & testing

---

## Testing Checklist

### Team Logos
- [ ] Upload logo for team
- [ ] Logo displays in team list
- [ ] Logo displays in matches
- [ ] Logo displays in standings
- [ ] Logo updates correctly
- [ ] Handles missing logos gracefully

### Bracket Visualization
- [ ] Displays correct bracket for 4 teams
- [ ] Displays correct bracket for 5 teams (with bye)
- [ ] Displays correct bracket for 8 teams
- [ ] Shows completed matches
- [ ] Shows TBD for future matches
- [ ] Responsive on different screen sizes

### Public Pages
- [ ] Generate unique slug
- [ ] Public URL works
- [ ] Non-hosts can view
- [ ] Non-hosts cannot edit
- [ ] Share link copies correctly
- [ ] Public tournaments listed

### Notifications
- [ ] Notifications created on events
- [ ] Badge count updates
- [ ] Notifications display correctly
- [ ] Mark as read works
- [ ] Delete notification works

---

## Risk Mitigation

### Potential Issues:
1. **Image Upload Performance**: Large images slow down app
   - **Solution**: Compress images before upload, max 500KB

2. **Bracket Complexity**: Complex layouts hard to render
   - **Solution**: Start with simple vertical layout, enhance later

3. **Public URL Conflicts**: Slug collisions
   - **Solution**: Use nanoid for unique slugs

4. **Notification Overload**: Too many notifications
   - **Solution**: Group similar notifications, allow preferences

---

## Dependencies to Add

### Frontend:
```json
{
  "expo-image-picker": "~14.7.1",
  "react-native-svg": "14.1.0",
  "react-native-qrcode-svg": "^6.2.0",
  "nanoid": "^5.0.0"
}
```

### Backend:
```json
{
  "nanoid": "^5.0.0"
}
```

---

## Database Changes

### Tournament Model:
```javascript
{
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  shareUrl: String
}
```

### Notification Model (New):
```javascript
{
  user: ObjectId,
  tournament: ObjectId,
  type: String, // 'MATCH_SCHEDULED', 'RESULT_ENTERED', etc.
  title: String,
  message: String,
  read: Boolean,
  createdAt: Date
}
```

---

## API Endpoints to Add

### Team Logos:
- ✅ `PUT /api/tournaments/:tournamentId/teams/:teamId` - Update team (including logo)

### Public Pages:
- `GET /api/tournaments/public/:slug` - Get tournament by slug
- `POST /api/tournaments/:id/generate-share-link` - Generate shareable link

### Notifications:
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/notifications/unread-count` - Get unread count

---

## Success Criteria

### Phase 2 Complete When:
- ✅ Team logos upload and display correctly
- ✅ Bracket visualization works for all team counts
- ✅ Public tournament pages accessible via link
- ✅ Notifications system functional
- ✅ All existing features still work
- ✅ No breaking changes
- ✅ Performance acceptable
- ✅ UI/UX polished

---

## Rollback Plan

If issues arise:
1. Feature flags to disable new features
2. Database migrations reversible
3. API endpoints backward compatible
4. Frontend gracefully handles missing data

---

**Status**: Ready to implement
**Start Date**: November 25, 2025
**Target Completion**: December 23, 2025 (4 weeks)
