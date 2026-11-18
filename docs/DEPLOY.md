# Deploying the site to Netlify

The safe order: **check locally → push to GitHub → deploy as a *new* Netlify site → test → move the domain**. The old Lovable site keeps serving the domain until the last step, so visitors never see a half-finished site, and rolling back means moving the domain back.

---

## 0. What you need

- A **GitHub** account. Yours or Althea's. The site's code will live there.
- **Althea's Netlify login** (or an invite to her Netlify team). The domain is connected to her account.
- This project on your machine, with every change committed (`git status` shows nothing).

---

## 1. Check the production build locally

```bash
npm run build
```

Expect `✓ Compiled successfully`, and `○ /  (Static)` in the route list. Then run the production server and click through the site:

```bash
npm start
```

Open http://localhost:3000 and check the intro, the hero, the portfolio galleries (play a video) and the mobile layout. Stop it with `Ctrl+C`.

> The inquiry form sends real emails through EmailJS, even locally. Only submit it when you mean to test it.

---

## 2. Put the code on GitHub

1. Go to https://github.com/new.
   - Name: `althea-portfolio`
   - Visibility: **Private** is fine; Netlify can still read it.
   - **Do not** tick "Add README", ".gitignore" or "license". The repo must be empty.
   - Click **Create repository**.
2. In this project's folder, run these lines one by one, replacing `YOUR-USERNAME`:

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/YOUR-USERNAME/althea-portfolio.git
```

```bash
git push -u origin main
```

The first push uploads the media (about 85 MB), so it takes a minute. If Git asks you to sign in, a browser window opens for GitHub login.

From now on, `git push` deploys automatically once step 3 is done.

---

## 3. Create a new Netlify site from the repo

1. Log in at https://app.netlify.com with Althea's account.
2. Click **Add new project → Import an existing project → GitHub**.
3. Authorize Netlify for GitHub if asked. Grant access to the `althea-portfolio` repo, or to all repos.
4. Pick `althea-portfolio`. Netlify reads `netlify.toml` and fills in:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 22

   Leave them as they are. There are no environment variables to add.
5. **Project name:** e.g. `althea-carvalho`, which gives the URL `althea-carvalho.netlify.app`.
6. Click **Deploy**. The first build takes 2–4 minutes. Watch the log under **Deploys**; it should end with **"Site is live"**.

If the build fails, open the deploy log, scroll to the first red line, and send it to me.

---

## 4. Test the new site at its `.netlify.app` URL

Open `https://althea-carvalho.netlify.app` (your chosen name) on a laptop **and** a phone:

- [ ] The intro card plays on load and doesn't come back when you click nav links
- [ ] The hero name sits on one line with no sideways scrolling on the phone
- [ ] Portfolio: all 3 cards have covers, the galleries open, videos play and Esc closes the popup
- [ ] Section snapping and smooth scroll feel right
- [ ] Footer email and phone links open the mail and phone apps

---

## 5. Check the inquiry form emails

The form sends through EmailJS (IDs in `src/data/site.ts → emailjs`) using the template `template_v4wxxmo`, which delivers to `hello@altheacarvalhomarketing.com`. Nothing to set up in Netlify.

1. In the EmailJS dashboard, **Account → Security**: add the live domain(s) to the allowed origins so the key can't be used elsewhere.
2. **Test it:** on the `.netlify.app` site, fill in the form with every field, tick 2+ needs, pick a budget, and send.
   - [ ] The "Thank you / Inquiry sent" panel appears
   - [ ] The send shows under **Email History** in EmailJS
   - [ ] The email arrives. Check spam the first time, then mark the sender "Not spam".
   - [ ] Replying to that email addresses the person who filled in the form

---

## 6. Move the domain from the old site to the new one

Only do this once steps 4 and 5 all pass. Expect a few minutes of possible downtime while the switch happens and HTTPS renews.

1. **Old site** (the Lovable one) → **Domain management** → next to `altheacarvalhomarketing.com` click **Options → Remove domain**. Remove `www.altheacarvalhomarketing.com` too if it's listed.
2. **New site** → **Domain management → Add a domain** → enter `altheacarvalhomarketing.com` → **Verify → Add domain**. Netlify adds `www` automatically and redirects one to the other.
3. Wait for the HTTPS certificate to show as active (**Domain management → HTTPS**). It usually takes a few minutes; click **Verify DNS configuration** if it waits more than about 15.
   - If the domain's DNS is **managed by Netlify** (nameservers like `dns1.p0x.nsone.net`), nothing else is needed.
   - If DNS is at **another registrar** (GoDaddy, Namecheap…), the records already point at Netlify, so it keeps working. If Netlify shows "awaiting external DNS", follow the record values it displays.
4. Open https://altheacarvalhomarketing.com in a private window and confirm it's the new site, with the padlock showing.
5. Optional: open the old link with tracking parameters, e.g. `https://altheacarvalhomarketing.com/?utm_source=ig`. It should load the new homepage.

**Rollback:** remove the domain from the new site and add it back to the old one.

---

## 7. After launch

- **Updating the site:** make changes, `git commit`, `git push`. Netlify rebuilds and goes live in about 2 minutes.
- **New portfolio content:** follow Step 23 in `docs/BUILD-GUIDE.md` (`npm run media`), then commit and push.
- **Deploy previews:** push to a branch other than `main` (`git push origin my-branch`) or open a pull request. Netlify builds a private preview URL without touching the live site.
- **Rollback a bad deploy:** **Deploys** → click an earlier deploy → **Publish deploy**.
- **Old site:** once the new one has run fine for a week or two, delete the old Netlify site (**Project configuration → Danger zone**).
- **Watch:** check the monthly email quota in EmailJS (**Account → Usage**) and the bandwidth usage on Althea's Netlify plan.
