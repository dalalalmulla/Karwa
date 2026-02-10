# Complete Recording Script - All Functionality

## 🎬 Task Creator Flow - Complete Functionality

### Setup (Before Recording)
- [ ] Backend running (`npm run dev` in `karwa-BE`)
- [ ] Frontend running (`npm start` in `karwa-FE`)
- [ ] App loaded on device/simulator
- [ ] Screen recording started
- [ ] Have a second account ready (for applier)

### Recording Steps:

**1. Login (0:00 - 0:15)**
- [ ] Open app
- [ ] Tap "Login" button on welcome screen
- [ ] Enter email and password
- [ ] Tap "Login" button
- [ ] Wait for home screen to load
- [ ] Show bottom tabs: Home, Create Task (+), Profile, Settings

**2. CREATE TASK (0:15 - 2:00)**
- [ ] Tap "+" (Create Task tab)
- [ ] Show empty form
- [ ] Enter title: "Clean my car"
- [ ] Enter description: "Need someone to wash and vacuum my car thoroughly. Interior and exterior cleaning required."
- [ ] Tap "Add Photos" button
- [ ] Select 1-2 images from gallery
- [ ] Show images appear in preview
- [ ] Enter money: "10" (KWD)
- [ ] Tap "Location" field
- [ ] Show location modal opens
- [ ] Select governorate: "Hawalli"
- [ ] Select area: "Salmiya"
- [ ] Enter Block Number: "5"
- [ ] Enter Street Number: "10"
- [ ] Enter Avenue: "Gulf Road"
- [ ] Enter House/Flat Number: "12"
- [ ] Tap "Done" or close modal
- [ ] Show location string appears in field
- [ ] Select type: "Outdoor"
- [ ] Tap "Create Task" button
- [ ] See success message: "Task created successfully!"
- [ ] Form automatically clears
- [ ] Navigate to home screen

**3. View Created Task (2:00 - 2:20)**
- [ ] Find your task in home screen
- [ ] Show task card with:
  - Thumbnail image
  - Title
  - Money amount
  - Points badge
  - Location (area, block)
- [ ] Tap on task card
- [ ] Show full task details

**4. View APPLICANTS (2:20 - 2:50)**
- [ ] Scroll to "Applicants" section
- [ ] Show applicant list (wait if none yet)
- [ ] Show each applicant card with:
  - Applicant name
  - Rating (⭐ X.X or "No rating")
  - Status badge (if assigned/rejected)
  - "Assign" button (for PENDING applicants)
- [ ] Show multiple applicants if available
- [ ] Show "No applicants yet" if empty

**5. ACCEPT/ASSIGN Worker (2:50 - 3:20)**
- [ ] Tap "Assign" button on an applicant
- [ ] Show confirmation alert: "Assign worker?"
- [ ] Tap "Assign" in alert
- [ ] See loading state
- [ ] See task status change to "ASSIGNED"
- [ ] See "Assigned Worker" section appear
- [ ] Show worker name and rating
- [ ] Show "Contact via WhatsApp" button
- [ ] See applicant status change to "Assigned" (green badge)
- [ ] Other applicants show "Rejected" (red badge)
- [ ] "Assign" buttons disappear for non-pending applicants

**6. Contact Worker via WhatsApp (3:20 - 3:35)**
- [ ] Tap "Contact via WhatsApp" button
- [ ] Show WhatsApp opens (or app picker)
- [ ] Show pre-filled message with:
  - Task title
  - Task ID
  - Worker name
- [ ] (Optional) Show message in WhatsApp

**7. Wait for Worker to Mark Complete (3:35 - 3:50)**
- [ ] Navigate back to task
- [ ] Show task status is still "ASSIGNED"
- [ ] Show "Confirm Completion" button is disabled/hidden
- [ ] (Note: Worker needs to mark complete first)
- [ ] Navigate away

**8. CONFIRM Completion (3:50 - 4:15)**
- [ ] (After worker marks complete - use second device or wait)
- [ ] Navigate back to task
- [ ] See task status is "IN_PROGRESS" or shows "Confirm Completion" button
- [ ] Tap "Confirm Completion" button
- [ ] See confirmation alert
- [ ] Tap "Confirm"
- [ ] See task status change to "COMPLETED"
- [ ] See success message
- [ ] Worker receives points notification

**9. RATE Worker (4:15 - 4:45)**
- [ ] See "Rate the Worker" section appear automatically
- [ ] Show section with:
  - Title: "Rate the Worker"
  - Description: "How was the work? Rate the worker who completed this task."
  - "Rate Worker" button
- [ ] Tap "Rate Worker" button
- [ ] Show rating modal opens
- [ ] Show star rating selector (1-5 stars)
- [ ] Select 5 stars (tap on 5th star)
- [ ] Tap "Submit" or "Rate" button
- [ ] See loading state
- [ ] See success message
- [ ] Modal closes
- [ ] "Rate the Worker" section disappears
- [ ] Worker's rating is updated

**10. View Completed Task in Profile (4:45 - 5:05)**
- [ ] Navigate to Profile tab
- [ ] Show profile information
- [ ] Show stats: Completed tasks count increased
- [ ] Scroll to "Completed Tasks" section
- [ ] Show completed task in list
- [ ] Tap on completed task
- [ ] Show task details with "COMPLETED" status
- [ ] Show assigned worker information
- [ ] Show that rating section is gone (already rated)

**End Recording** ✅

---

## 🎬 Task Applier Flow - Complete Functionality

### Setup (Before Recording)
- [ ] Backend running
- [ ] Frontend running
- [ ] App loaded on device/simulator
- [ ] Screen recording started
- [ ] Logout if logged in (to show unauthenticated view)
- [ ] Have a task already created by creator account

### Recording Steps:

**1. Browse Tasks (Unauthenticated) (0:00 - 0:40)**
- [ ] Open app (not logged in)
- [ ] Show welcome/login screen
- [ ] Tap "Login" button (but don't login yet)
- [ ] Navigate back or show home screen
- [ ] Show home screen with tasks (public view)
- [ ] Scroll through task cards
- [ ] Show task card details:
  - Thumbnail image
  - Title
  - Money amount (KWD)
  - Points badge
  - Location (area, block)
- [ ] Tap on a task card

**2. View Task Details (Unauthenticated) (0:40 - 1:10)**
- [ ] Show full task details:
  - Title and description
  - Photos gallery
  - Money amount
  - Points
  - Location (area and block only - not full address)
  - Poster rating
  - Task type (Indoor/Outdoor)
  - Created date
- [ ] Scroll to see all details
- [ ] Show "Apply for this Task" button is visible

**3. Try to APPLY (Unauthenticated) (1:10 - 1:30)**
- [ ] Tap "Apply for this Task" button
- [ ] Show alert: "You need to login to apply. Would you like to login?"
- [ ] Show two options: "Cancel" and "Login"
- [ ] Tap "Login" in alert
- [ ] Navigate to login screen

**4. Login (1:30 - 1:50)**
- [ ] Show login form
- [ ] Enter email (applier account)
- [ ] Enter password
- [ ] Tap "Login" button
- [ ] See loading state
- [ ] Wait for home screen
- [ ] Show user is now logged in

**5. APPLY to Task (1:50 - 2:15)**
- [ ] Find the same task again (or navigate back)
- [ ] Tap on task card
- [ ] Show task details again
- [ ] Tap "Apply for this Task" button
- [ ] See loading state
- [ ] See confirmation message: "✓ You have applied to this task"
- [ ] Show "Apply" button is replaced with applied indicator
- [ ] Button text changes or shows checkmark

**6. Wait for ACCEPTANCE/ASSIGNMENT (2:15 - 2:35)**
- [ ] Navigate to home screen
- [ ] Show task still appears in list
- [ ] Show task status is still "OPEN"
- [ ] Tap on task again
- [ ] Show you're not the assigned worker yet
- [ ] Show applicants list (if visible to applicants)
- [ ] (Note: In real scenario, wait for creator to assign)
- [ ] Navigate away

**7. View ACCEPTED/ASSIGNED Task (2:35 - 3:05)**
- [ ] (After creator assigns you - use creator account or wait)
- [ ] Navigate back to home
- [ ] Find task in home screen
- [ ] Show task still visible (creator's assigned tasks show)
- [ ] Tap on task
- [ ] See task status is "ASSIGNED"
- [ ] See "Assigned Worker" section shows your name
- [ ] Show your rating (if you have one)
- [ ] See "Contact" section with WhatsApp button
- [ ] See "Mark as Complete" button is now visible

**8. Contact Poster via WhatsApp (3:05 - 3:20)**
- [ ] Tap "Contact via WhatsApp" button
- [ ] Show WhatsApp opens (or app picker)
- [ ] Show pre-filled message with:
  - Task title
  - Task ID
  - Poster name

**9. Mark Task Complete (3:20 - 3:45)**
- [ ] Navigate back to task
- [ ] Scroll to "Mark Complete" section
- [ ] Show section with:
  - Title: "Mark as Complete"
  - Description: "Let the poster know you've finished the task"
  - "Mark as Complete" button
- [ ] Tap "Mark as Complete" button
- [ ] See confirmation alert (if any)
- [ ] Tap "Confirm" or "Mark Complete"
- [ ] See loading state
- [ ] See task status change to "IN_PROGRESS"
- [ ] See message: "Waiting for poster confirmation"
- [ ] "Mark as Complete" button disappears or is disabled

**10. Wait for CONFIRMATION (3:45 - 4:00)**
- [ ] Navigate away from task
- [ ] Show task status is "IN_PROGRESS"
- [ ] (Note: Creator needs to confirm completion)
- [ ] Navigate back to task
- [ ] Show waiting state

**11. View CONFIRMED/COMPLETED Task (4:00 - 4:25)**
- [ ] (After creator confirms completion)
- [ ] Navigate to task
- [ ] See task status is "COMPLETED"
- [ ] See success message or notification
- [ ] Show points earned (if visible)
- [ ] See "Mark as Complete" section is gone
- [ ] See "Rate the Poster" section appears

**12. RATE Poster (4:25 - 4:55)**
- [ ] See "Rate the Poster" section automatically appears
- [ ] Show section with:
  - Title: "Rate the Poster"
  - Description: "Share your experience working with [Poster Name]"
  - "Rate Poster" button
- [ ] Tap "Rate Poster" button
- [ ] Show rating modal opens
- [ ] Show star rating selector (1-5 stars)
- [ ] Select 5 stars (tap on 5th star)
- [ ] Tap "Submit" or "Rate" button
- [ ] See loading state
- [ ] See success message
- [ ] Modal closes
- [ ] "Rate the Poster" section disappears
- [ ] Poster's rating is updated

**13. View Profile & Points (4:55 - 5:20)**
- [ ] Navigate to Profile tab
- [ ] Show profile information:
  - Name
  - Email
  - Rating (if visible)
- [ ] Show stats section:
  - Completed tasks count (increased)
  - Points earned (increased by task points)
  - Other stats
- [ ] Scroll to "Completed Tasks" section
- [ ] Show completed task in list
- [ ] Tap on completed task
- [ ] Show task details with "COMPLETED" status
- [ ] Show poster information
- [ ] Show that rating section is gone (already rated)
- [ ] Show points earned from this task

**End Recording** ✅

---

## 🎯 All Functionality Checklist

### ✅ Task Creator Must Show:
1. **CREATE** - Full task creation with:
   - Title, description, photos
   - Money amount
   - Location (3-level: governorate → area → address details)
   - Task type (indoor/outdoor)
   - Form validation and clearing

2. **VIEW APPLICANTS** - See all applicants:
   - Applicant names
   - Ratings
   - Status badges (Pending/Assigned/Rejected)
   - Application history

3. **ACCEPT/ASSIGN** - Assign worker:
   - Select applicant
   - Confirm assignment
   - Status changes to ASSIGNED
   - Other applicants marked as Rejected
   - Assigned worker section appears

4. **CONTACT** - WhatsApp integration:
   - Contact assigned worker
   - Pre-filled message with task details

5. **CONFIRM** - Confirm completion:
   - After worker marks complete
   - Status changes to COMPLETED
   - Worker receives points

6. **RATE** - Rate worker:
   - Rating section appears after completion
   - Select 1-5 stars
   - Submit rating
   - Section disappears after rating

### ✅ Task Applier Must Show:
1. **BROWSE** - View tasks without login:
   - Public task listing
   - Task cards with key info
   - Full task details

2. **APPLY** - Apply to task:
   - Login prompt when not authenticated
   - Apply button
   - Application confirmation
   - Applied status indicator

3. **VIEW ASSIGNMENT** - See when accepted:
   - Task status changes to ASSIGNED
   - Assigned worker section shows your name
   - Contact poster via WhatsApp

4. **MARK COMPLETE** - Mark task as done:
   - Mark as Complete button
   - Status changes to IN_PROGRESS
   - Wait for confirmation

5. **VIEW COMPLETION** - See confirmed task:
   - Status changes to COMPLETED
   - Points earned notification
   - Rating section appears

6. **RATE** - Rate poster:
   - Rating section appears after completion
   - Select 1-5 stars
   - Submit rating
   - Section disappears after rating

7. **PROFILE** - View completed tasks:
   - Completed tasks list
   - Points earned
   - Task history

---

## ⚠️ Common Issues to Avoid

1. **Don't show errors** - If something fails, restart that section
2. **Keep it smooth** - Avoid long pauses or waiting
3. **Show key features** - Highlight unique features like:
   - 3-level location selection
   - Mutual rating system
   - WhatsApp integration
   - Points system
4. **Clear actions** - Tap buttons clearly and wait for responses
5. **Good flow** - Make sure transitions are smooth
6. **Complete flows** - Show entire process from start to finish
7. **Status changes** - Clearly show status transitions:
   - OPEN → ASSIGNED → IN_PROGRESS → COMPLETED
8. **Rating visibility** - Show rating sections appear and disappear correctly

## 📋 Pre-Recording Checklist

### Accounts Setup:
- [ ] Creator account ready (email/password)
- [ ] Applier account ready (email/password)
- [ ] Both accounts can login successfully

### Tasks Setup:
- [ ] At least one task created by creator
- [ ] Task has photos, location, money, points
- [ ] Task is in OPEN status

### App State:
- [ ] Backend server running and accessible
- [ ] Frontend app running without errors
- [ ] Network connection stable
- [ ] No pending notifications
- [ ] App is responsive

### Recording Setup:
- [ ] Screen recording app ready
- [ ] Device charged or plugged in
- [ ] Do Not Disturb enabled
- [ ] Notifications cleared
- [ ] Good lighting (if showing physical device)

---

## 📱 Device-Specific Tips

### iOS:
- Use built-in screen recorder (best quality)
- Record in portrait mode
- Disable Do Not Disturb mode

### Android:
- Use built-in screen recorder or AZ Screen Recorder
- Record in portrait mode
- Clear notifications before recording

---

Good luck! 🎥✨

