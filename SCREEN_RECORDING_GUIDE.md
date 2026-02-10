# Screen Recording Guide for Karwa App

This guide will help you create video demonstrations of the task creator and task applier flows.

## 📱 How to Record Screen

### iOS (iPhone/iPad)
1. Open **Settings** → **Control Center** → **Screen Recording** (add if not present)
2. Swipe down from top-right corner (or up from bottom on older devices)
3. Tap the **Screen Recording** button (circle icon)
4. Wait for 3-second countdown
5. Start using the app
6. To stop: Tap the red status bar at top → **Stop**

### Android
1. Swipe down from top to open Quick Settings
2. Look for **Screen Recorder** or **Screen Record** (may vary by device)
3. Tap to start recording
4. Grant permissions if prompted
5. Start using the app
6. To stop: Tap the notification → **Stop**

### Alternative: Use Screen Recording Apps
- **iOS**: Built-in screen recorder (best quality)
- **Android**: Built-in or apps like AZ Screen Recorder, DU Recorder
- **Computer**: Use QuickTime (Mac) or OBS Studio (Windows/Mac/Linux) with device connected

---

## 🎬 Task Creator Flow (Poster)

### Flow Steps:
1. **Login/Register**
   - Open app
   - Login or register new account
   - Navigate to home screen

2. **Create Task**
   - Tap **"+"** (Create Task) tab
   - Fill in task details:
     - Title: e.g., "Clean my car"
     - Description: e.g., "Need someone to wash and vacuum my car"
     - Upload photos (optional)
     - Money: e.g., "10" KWD
     - Location: Select governorate → area → enter address details
     - Type: Indoor/Outdoor
   - Tap **"Create Task"**
   - See success message

3. **View Task in Home**
   - Task appears in home screen
   - Tap task to view details

4. **View Applicants**
   - Scroll to "Applicants" section
   - See list of people who applied
   - Each applicant shows name, rating, and "Assign" button

5. **Assign Worker**
   - Tap **"Assign"** button on an applicant
   - Confirm assignment
   - Task status changes to "ASSIGNED"
   - Assigned worker appears in "Assigned Worker" section
   - WhatsApp button appears to contact worker

6. **Wait for Worker to Complete**
   - Worker marks task as complete
   - Task status becomes "IN_PROGRESS" or "COMPLETED"

7. **Confirm Completion**
   - Tap **"Confirm Completion"** button
   - Task status becomes "COMPLETED"
   - Worker receives points

8. **Rate Worker**
   - "Rate the Worker" section appears
   - Tap **"Rate Worker"** button
   - Select rating (1-5 stars)
   - Submit rating
   - Rating section disappears after submission

9. **View Completed Task**
   - Task shows as "COMPLETED"
   - Can view in Profile → Completed Tasks

---

## 🎬 Task Applier Flow (Worker)

### Flow Steps:
1. **View Tasks (Without Login)**
   - Open app (no login required)
   - Browse tasks on home screen
   - See task cards with title, money, points, location

2. **View Task Details**
   - Tap on a task card
   - See full task details:
     - Description
     - Photos
     - Money amount
     - Points
     - Location (area and block only)
     - Poster rating

3. **Login to Apply**
   - Tap **"Apply for this Task"** button
   - Alert appears: "You need to login to apply"
   - Tap **"Login"**
   - Enter email and password
   - Login successful

4. **Apply to Task**
   - Navigate back to task (or find it again)
   - Tap **"Apply for this Task"** button
   - See confirmation: "✓ You have applied to this task"

5. **Wait for Assignment**
   - Task creator assigns you
   - Task status changes to "ASSIGNED"
   - You can see you're the assigned worker

6. **Mark Task Complete**
   - Tap **"Mark as Complete"** button
   - Task status becomes "IN_PROGRESS"
   - Wait for poster confirmation

7. **Poster Confirms**
   - Poster confirms completion
   - Task status becomes "COMPLETED"
   - You receive points (shown in profile)

8. **Rate Poster**
   - "Rate the Poster" section appears
   - Tap **"Rate Poster"** button
   - Select rating (1-5 stars)
   - Submit rating
   - Rating section disappears after submission

9. **View Completed Task**
   - Task shows as "COMPLETED"
   - Can view in Profile → Completed Tasks

---

## 🎯 Key Features to Highlight

### Task Creator:
- ✅ Create task with detailed location selection
- ✅ View all applicants with ratings
- ✅ Assign worker
- ✅ Contact worker via WhatsApp
- ✅ Confirm completion
- ✅ Rate worker after completion

### Task Applier:
- ✅ Browse tasks without login
- ✅ View task details
- ✅ Login when needed
- ✅ Apply to tasks
- ✅ Mark task as complete
- ✅ Receive points
- ✅ Rate poster after completion

---

## 📝 Tips for Better Recording

1. **Prepare Test Data**
   - Create 2-3 test accounts (one creator, one applier)
   - Have some tasks already created
   - Have some completed tasks for profile view

2. **Recording Settings**
   - Use highest quality settings
   - Record in portrait mode (mobile app)
   - Ensure good lighting if showing physical device
   - Clear notifications before recording

3. **Flow Tips**
   - Pause briefly at each important step
   - Show key UI elements clearly
   - Demonstrate error handling (optional)
   - Show both success and completion states

4. **Editing (Optional)**
   - Trim unnecessary waiting time
   - Add text annotations for key steps
   - Add background music (optional)
   - Keep videos under 5-10 minutes each

---

## 🎬 Recommended Video Structure

### Video 1: Task Creator Flow (5-7 minutes)
1. Introduction (5 sec)
2. Login (10 sec)
3. Create Task (60 sec)
4. View Applicants (30 sec)
5. Assign Worker (30 sec)
6. Contact Worker (20 sec)
7. Confirm Completion (30 sec)
8. Rate Worker (30 sec)
9. View Profile/Completed Tasks (20 sec)

### Video 2: Task Applier Flow (5-7 minutes)
1. Introduction (5 sec)
2. Browse Tasks (30 sec)
3. View Task Details (20 sec)
4. Login (20 sec)
5. Apply to Task (20 sec)
6. Wait for Assignment (10 sec)
7. Mark Complete (20 sec)
8. Receive Points (20 sec)
9. Rate Poster (30 sec)
10. View Profile/Completed Tasks (20 sec)

---

## ✅ Checklist Before Recording

- [ ] Backend server is running
- [ ] Frontend app is running and connected
- [ ] Test accounts are ready
- [ ] Test tasks are created
- [ ] Screen recording app is ready
- [ ] Notifications are disabled
- [ ] Device is charged/plugged in
- [ ] Good internet connection
- [ ] Quiet environment (for audio if needed)

---

## 🚀 Quick Start Commands

```bash
# Start backend
cd karwa-BE
npm run dev

# Start frontend (in another terminal)
cd karwa-FE
npm start

# Then scan QR code or use expo URL
```

---

Good luck with your screen recording! 🎥

