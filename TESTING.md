# Testing Nexusflow locally

A manual checklist that walks one project through its whole life, touching every
feature. Takes about 15 minutes.

## 1. Start everything

You need three things running: MongoDB, the backend and the frontend.

```bash
# MongoDB (permanent install, once)
brew trust mongodb/brew && brew install mongodb-community && brew services start mongodb-community

# Test accounts (safe to re-run)
npm --prefix server run seed

# Backend on http://localhost:4000 (leave running)
node --watch server/server.js

# Frontend on http://localhost:5173 (in another terminal, leave running)
npm --prefix client run dev
```

Open http://localhost:5173. The test logins (Admin, Teacher, Student) are listed
at the top of `server/scripts/seed.js`. Always pick the matching **Select Role**.

To create a real admin: `npm --prefix server run create-admin -- you@example.com YourPassword "Your Name"`

## 2. Walk through the app

Tick each box as you go. Each line says what to do, then what you should see.

### Admin: set up people
- [ ] Log in with a wrong password → "Invalid email, password or role"
- [ ] Log in as Admin → dashboard shows student and teacher counts
- [ ] Manage Teachers → Add New Teacher (fill every field) → teacher appears in the list
- [ ] Edit that teacher → change Max Students and fill **New password** → toast "Password updated for …"
- [ ] Manage Students → Add New Student → student appears in the list
- [ ] Sign out, then open http://localhost:5173/admin → sent back to the login page

### Student: propose and request
- [ ] Log in as Student → "No project yet"
- [ ] Submit Proposal → toast "Project proposal submitted successfully"
- [ ] Submit a second proposal → refused ("You already have an active project…")
- [ ] Supervisor → Request a teacher with a message → button shows "Request pending", request listed as Pending
- [ ] Upload Files → pick a PDF → it appears under Uploaded Files → Download works
- [ ] Try uploading a `.exe` → "Invalid file type…"
- [ ] Profile menu (top right) → Change password → mismatched confirmation shows an error; correct one shows "Password updated successfully"

### Admin: approve and schedule
- [ ] Projects → the proposal is Pending → Files (1) shows the upload → Approve → counters update
- [ ] Deadlines → Create/Update Deadline → search the project, pick a date, Save → date shows in the table

### Teacher: accept and guide
- [ ] Log in as the requested Teacher → dashboard shows 1 pending request and a notification
- [ ] Pending Requests → card shows project title, message and "Ready to accept" → Accept
- [ ] Assigned Students → student is listed → Give feedback → feedback appears under the student
- [ ] Files → the student's file is listed → Download works

### Student: see the results
- [ ] Dashboard shows Approved, the supervisor, the deadline, the feedback and notifications
- [ ] Feedback → supervisor feedback at the top → leave a star rating → it appears under Your Previous Ratings
- [ ] Notifications → Mark as read lowers the Unread count → Mark all as read clears it (still cleared after refresh)

### Finish
- [ ] Teacher → Assigned Students → Mark completed → status becomes Completed
- [ ] Admin dashboard → the project appears under Final Reports & Documentation
- [ ] Admin → Assign Supervisor → for another approved project, pick a teacher and Assign → slot count drops
- [ ] Admin → delete a teacher → their students' projects become unassigned
- [ ] Admin → delete a student → removed from the list
- [ ] Forgot your password? → any email → "If an account with that email exists…"

## Known limitation

Emails (request accepted/rejected, password reset) only send if the SMTP
settings in `server/.env` are valid. For Gmail you need an
[App Password](https://myaccount.google.com/apppasswords), not your normal
password. Everything else works without email.
