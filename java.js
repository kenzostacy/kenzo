
        // ============================================================
        // Theme Toggle
        // ============================================================
        const themeToggle = document.getElementById('theme-toggle');
        const rootBody = document.body;

        // ============================================================
        // Admin gate logic
        // NOTE: this is a client-side gate only, to keep the manager
        // panel tidy for casual visitors. It is not real security —
        // anyone who reads the page source can find the password.
        // ============================================================
        const ADMIN_PASSWORD = 'kenzostacy';
        let isAdmin = false;

        const managerSection = document.getElementById('manager');
        const adminToggle = document.getElementById('admin-toggle');
        const adminFabTooltip = document.getElementById('admin-fab-tooltip');
        const adminOverlay = document.getElementById('admin-modal-overlay');
        const adminForm = document.getElementById('admin-login-form');
        const adminPasswordInput = document.getElementById('admin-password');
        const adminPasswordEye = document.getElementById('admin-password-eye');
        const adminError = document.getElementById('admin-error');
        const adminCancelBtn = document.getElementById('admin-cancel-btn');
        const adminCloseX = document.getElementById('admin-close-x');
        const adminBackLink = document.getElementById('admin-back-link');
        const adminLogoutBtn = document.getElementById('admin-logout-btn');

        const EYE_OPEN_ICON = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg>';
        const EYE_OFF_ICON = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3l18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M10.6 5.2C11 5.1 11.5 5 12 5c6.4 0 10 7 10 7-.6 1.1-1.5 2.4-2.7 3.5M6.6 6.6C4.4 8 3 12 3 12s3.6 7 10 7c1.4 0 2.7-.3 3.8-.9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.9 10c-.3.4-.5.9-.5 1.4a2.6 2.6 0 0 0 3.7 2.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

        function setEyeIcon(showing) {
            adminPasswordEye.innerHTML = showing ? EYE_OFF_ICON : EYE_OPEN_ICON;
            adminPasswordEye.setAttribute('aria-label', showing ? 'Hide password' : 'Show password');
        }
        function openAdminModal() {
            adminError.textContent = '';
            adminPasswordInput.value = '';
            adminPasswordInput.type = 'password';
            setEyeIcon(false);
            adminOverlay.classList.add('open');
            adminPasswordInput.focus();
        }
        function closeAdminModal() { adminOverlay.classList.remove('open'); }
        function setAdminState(active) {
            isAdmin = active;
            rootBody.classList.toggle('admin-mode', active);
            managerSection.classList.toggle('unlocked', active);
            adminToggle.setAttribute('aria-label', active ? 'Admin (signed in) — click to log out' : 'Admin login');
            adminToggle.title = active ? 'Signed in as admin — click to log out' : 'Admin login';
            adminFabTooltip.textContent = active ? 'Admin ✓ — log out' : 'Admin login';
        }

        adminPasswordEye.addEventListener('click', () => {
            const showing = adminPasswordInput.type === 'text';
            adminPasswordInput.type = showing ? 'password' : 'text';
            setEyeIcon(!showing);
        });
        adminCloseX.addEventListener('click', closeAdminModal);
        adminBackLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeAdminModal();
            document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
        });
        adminLogoutBtn.addEventListener('click', () => setAdminState(false));
        adminToggle.addEventListener('click', () => {
            if (isAdmin) setAdminState(false);
            else openAdminModal();
        });
        adminCancelBtn.addEventListener('click', closeAdminModal);
        adminOverlay.addEventListener('click', (e) => { if (e.target === adminOverlay) closeAdminModal(); });
        adminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (adminPasswordInput.value === ADMIN_PASSWORD) {
                setAdminState(true);
                closeAdminModal();
            } else {
                adminError.textContent = 'Incorrect password. Try again.';
            }
        });
        setAdminState(false);

        // Keep floating admin logo centered on the navbar line
        const adminFabWrap = document.getElementById('admin-fab-wrap');
        const navbarEl = document.querySelector('.navbar');
        function alignAdminFab() {
            const navRect = navbarEl.getBoundingClientRect();
            const top = navRect.top + navRect.height + 12;
            adminFabWrap.style.top = `${Math.max(top, 12)}px`;
        }
        alignAdminFab();
        window.addEventListener('resize', alignAdminFab);
        window.addEventListener('load', alignAdminFab);

        // ============================================================
        // Direct email delivery (EmailJS) — sends straight to your inbox,
        // no popup, no visitor click required.
        //
        // SETUP (takes ~2 minutes, free):
        //   1. Go to https://www.emailjs.com and create a free account.
        //   2. Add an Email Service (connect kenzostacy2@gmail.com) →
        //      copy the "Service ID" into EMAILJS_CONFIG.serviceId below.
        //   3. Create an Email Template (use {{from_name}}, {{from_email}},
        //      {{message}} as variables in the template body, and set the
        //      template's "To email" field to kenzostacy2@gmail.com) →
        //      copy the "Template ID" into EMAILJS_CONFIG.templateId below.
        //   4. In Account → General, copy your "Public Key" into
        //      EMAILJS_CONFIG.publicKey below.
        //
        // Until all three are filled in, the form automatically falls back
        // to opening the visitor's email app instead (the old behavior) —
        // it never silently fails.
        // ============================================================
        const EMAIL_RECIPIENT = 'kenzostacy2@gmail.com';
        const EMAILJS_CONFIG = {
            serviceId: '',   // e.g. 'service_abc1234'
            templateId: '',  // e.g. 'template_xyz9876'
            publicKey: ''    // e.g. 'AbCdEfGhIjKlMnOp'
        };
        const EMAILJS_READY = !!(EMAILJS_CONFIG.serviceId && EMAILJS_CONFIG.templateId && EMAILJS_CONFIG.publicKey);
        if (EMAILJS_READY && window.emailjs) {
            emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
        }

        async function sendDirectEmail(name, email, message) {
            if (!EMAILJS_READY || !window.emailjs) return { sent: false, reason: 'not-configured' };
            try {
                await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
                    from_name: name,
                    from_email: email,
                    message: message,
                    to_email: 'kenzostacy2@gmail.com'
                });
                return { sent: true };
            } catch (err) {
                return { sent: false, reason: 'send-failed' };
            }
        }

        // ============================================================
        // Persistent storage helpers
        // All data below is SHARED (shared=true): every visitor and
        // the admin read/write the same underlying records, so the
        // manager list and messages persist across refreshes and
        // across different people's browsers, not just in memory.
        // ============================================================
        const hasStorage = !!(window.storage && typeof window.storage.set === 'function');
        const hasLocalStorage = typeof window.localStorage !== 'undefined';

        async function storageGet(key) {
            if (hasStorage) {
                try {
                    const res = await window.storage.get(key, true);
                    return res ? res.value : null;
                } catch (e) {
                    return null;
                }
            }
            if (hasLocalStorage) {
                return window.localStorage.getItem(key);
            }
            return null;
        }
        async function storageSet(key, value) {
            if (hasStorage) {
                try {
                    const res = await window.storage.set(key, value, true);
                    return !!res;
                } catch (e) {
                    return false;
                }
            }
            if (hasLocalStorage) {
                try {
                    window.localStorage.setItem(key, value);
                    return true;
                } catch (e) {
                    return false;
                }
            }
            return false;
        }
        async function storageDelete(key) {
            if (hasStorage) {
                try {
                    await window.storage.delete(key, true);
                    return true;
                } catch (e) {
                    return false;
                }
            }
            if (hasLocalStorage) {
                try {
                    window.localStorage.removeItem(key);
                    return true;
                } catch (e) {
                    return false;
                }
            }
            return false;
        }
        async function storageList(prefix) {
            if (hasStorage) {
                try {
                    const res = await window.storage.list(prefix, true);
                    return (res && res.keys) ? res.keys : [];
                } catch (e) {
                    return [];
                }
            }
            if (hasLocalStorage) {
                const keys = [];
                for (let i = 0; i < window.localStorage.length; i++) {
                    const key = window.localStorage.key(i);
                    if (key && key.startsWith(prefix)) keys.push(key);
                }
                return keys;
            }
            return [];
        }

        // ============================================================
        // Product & Person Manager — now persisted for real, for everyone
        // ============================================================
        let entries = [
            { person: "Kenzo Stacy", product: "E-Commerce Web Design" },
            { person: "Sarah Jenkins", product: "Brand System & Mobile UI" }
        ];
        const ENTRIES_KEY = 'kenzo-portfolio:entries';
        const USERS_KEY = 'kenzo-portfolio:users';
        let users = [];

        const form = document.getElementById('product-form');
        const personInput = document.getElementById('person-name');
        const productInput = document.getElementById('product-name');
        const editIndexInput = document.getElementById('edit-index');
        const submitBtn = document.getElementById('form-submit-btn');
        const listContainer = document.getElementById('product-list');
        const entriesSyncNote = document.getElementById('entries-sync-note');

        function escapeHtml(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function renderEntries() {
            listContainer.innerHTML = '';
            if (!entries.length) {
                listContainer.innerHTML = `<tr><td colspan="3" class="empty-state">No entries yet. Add one above.</td></tr>`;
                return;
            }
            entries.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${escapeHtml(item.person)}</td>
                    <td>${escapeHtml(item.product)}</td>
                    <td>
                        <button class="btn-edit" onclick="editEntry(${index})">Edit</button>
                        <button class="btn-danger" onclick="deleteEntry(${index})">Delete</button>
                    </td>
                `;
                listContainer.appendChild(tr);
            });
        }

        const userListContainer = document.getElementById('users-list');

        function renderUsers() {
            if (!userListContainer) return;
            userListContainer.innerHTML = '';
            if (!users.length) {
                userListContainer.innerHTML = `<tr><td colspan="4" class="empty-state">No users have submitted contact requests yet.</td></tr>`;
                return;
            }
            users.forEach((user) => {
                const tr = document.createElement('tr');
                const canGrant = user.status !== 'active';
                const actionLabel = user.status === 'banned' ? 'Grant' : 'Ban';
                const statusLabel = user.status === 'banned' ? 'Banned' : 'Active';
                tr.innerHTML = `
                    <td>${escapeHtml(user.name)}</td>
                    <td>${escapeHtml(user.email)}</td>
                    <td>${escapeHtml(statusLabel)}</td>
                    <td>
                        <button class="btn-edit" onclick="toggleUserStatus('${encodeURIComponent(user.email)}')">${actionLabel}</button>
                    </td>
                `;
                userListContainer.appendChild(tr);
            });
        }

        async function loadUsers() {
            const raw = await storageGet(USERS_KEY);
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) users = parsed;
                } catch (e) { users = []; }
            }
            renderUsers();
        }

        async function saveUsers() {
            await storageSet(USERS_KEY, JSON.stringify(users));
            renderUsers();
        }

        function upsertUser(name, email) {
            const normalized = email.trim().toLowerCase();
            if (!normalized) return;
            const existing = users.find(u => u.email === normalized);
            if (existing) {
                existing.name = name || existing.name;
                existing.status = existing.status || 'active';
            } else {
                users.push({ name: name || 'Visitor', email: normalized, status: 'active' });
            }
        }

        window.toggleUserStatus = async function (encodedEmail) {
            const email = decodeURIComponent(encodedEmail);
            const user = users.find(u => u.email === email);
            if (!user) return;
            user.status = user.status === 'banned' ? 'active' : 'banned';
            await saveUsers();
        };

        async function loadEntries() {
            const raw = await storageGet(ENTRIES_KEY);
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) entries = parsed;
                } catch (e) { /* keep defaults if corrupt */ }
            } else if (hasStorage) {
                // First time ever loading: seed shared storage with the defaults
                await storageSet(ENTRIES_KEY, JSON.stringify(entries));
            }
            renderEntries();
        }

        async function saveEntries() {
            const ok = await storageSet(ENTRIES_KEY, JSON.stringify(entries));
            entriesSyncNote.textContent = hasStorage
                ? (ok ? 'Saved — visible to everyone who visits this site.' : 'Could not save changes just now, please retry.')
                : 'Storage unavailable here — changes will only last for this session.';
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const person = personInput.value.trim();
            const product = productInput.value.trim();
            const editIndex = parseInt(editIndexInput.value, 10);
            if (editIndex === -1) {
                entries.push({ person, product });
            } else {
                entries[editIndex] = { person, product };
                editIndexInput.value = "-1";
                submitBtn.textContent = "Add Entry";
            }
            personInput.value = '';
            productInput.value = '';
            renderEntries();
            await saveEntries();
        });
        window.editEntry = function (index) {
            personInput.value = entries[index].person;
            productInput.value = entries[index].product;
            editIndexInput.value = index;
            submitBtn.textContent = "Update Entry";
        };
        window.deleteEntry = async function (index) {
            entries.splice(index, 1);
            renderEntries();
            await saveEntries();
        };

        // ============================================================
        // Real visitor messages — every contact-form submission is
        // saved so the admin can review actual people who reached out,
        // not just whoever happened to have the manager panel open.
        // ============================================================
        const messagesList = document.getElementById('messages-list');
        const messagesCountNote = document.getElementById('messages-count-note');

        function formatTimestamp(ts) {
            try {
                return new Date(ts).toLocaleString();
            } catch (e) {
                return '';
            }
        }

        async function loadMessages() {
            const keys = await storageList('kenzo-portfolio:message:');
            const items = [];
            for (const key of keys) {
                const raw = await storageGet(key);
                if (!raw) continue;
                try {
                    const data = JSON.parse(raw);
                    items.push({ key, ...data });
                } catch (e) { /* skip corrupt entry */ }
            }
            items.sort((a, b) => (b.ts || 0) - (a.ts || 0));
            renderMessages(items);
        }

        function renderMessages(items) {
            messagesList.innerHTML = '';
            messagesCountNote.textContent = hasStorage
                ? `${items.length} message${items.length === 1 ? '' : 's'} on file`
                : 'Storage unavailable here';
            if (!items.length) {
                messagesList.innerHTML = `<tr><td colspan="5" class="empty-state">No messages yet.</td></tr>`;
                return;
            }
            items.forEach((item) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${escapeHtml(item.name || '')}</td>
                    <td>${escapeHtml(item.email || '')}</td>
                    <td class="msg-cell">${escapeHtml(item.message || '')}</td>
                    <td>${escapeHtml(formatTimestamp(item.ts))}</td>
                    <td><button class="btn-danger" onclick="deleteMessage('${item.key}')">Delete</button></td>
                `;
                messagesList.appendChild(tr);
            });
        }

        window.deleteMessage = async function (key) {
            await storageDelete(key);
            await loadMessages();
        };

        async function saveMessage(name, email, message) {
            const key = `kenzo-portfolio:message:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            await storageSet(key, JSON.stringify({ name, email, message, ts: Date.now() }));
            upsertUser(name, email);
            await saveUsers();
            if (isAdmin) await loadMessages();
        }

        // ============================================================
        // Live "active now" tracking — real heartbeats from real
        // visitors, not a fake/random counter.
        // ============================================================
        const PRESENCE_PREFIX = 'kenzo-portfolio:presence:';
        const PRESENCE_WINDOW_MS = 45000; // consider a visitor active if seen in the last 45s
        const sessionId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        const activeBadge = document.getElementById('active-badge');

        async function sendHeartbeat() {
            await storageSet(`${PRESENCE_PREFIX}${sessionId}`, JSON.stringify({ ts: Date.now() }));
        }

        async function refreshActiveCount() {
            if (!hasStorage) {
                activeBadge.innerHTML = '<span class="active-dot"></span> Active now: n/a';
                return;
            }
            const keys = await storageList(PRESENCE_PREFIX);
            const now = Date.now();
            let active = 0;
            for (const key of keys) {
                const raw = await storageGet(key);
                if (!raw) continue;
                try {
                    const data = JSON.parse(raw);
                    if (now - (data.ts || 0) < PRESENCE_WINDOW_MS) active++;
                } catch (e) { /* ignore corrupt entry */ }
            }
            activeBadge.innerHTML = `<span class="active-dot"></span> Active now: ${active}`;
        }

        // ============================================================
        // Init
        // ============================================================
        (async function init() {
            // Theme (kept in-memory + read from storage so it's not lost on refresh,
            // since localStorage can't be used inside this artifact)
            if (hasStorage) {
                const savedTheme = await storageGet('kenzo-portfolio:theme'); // personal, not shared
            }
            themeToggle.addEventListener('click', () => {
                const isLight = rootBody.classList.toggle('light');
                themeToggle.textContent = isLight ? '☀️' : '🌙';
            });

            await loadEntries();
            await loadMessages();
            await loadUsers();

            await sendHeartbeat();
            await refreshActiveCount();
            setInterval(sendHeartbeat, 15000);
            setInterval(refreshActiveCount, 10000);
        })();

        // ============================================================
        // Contact form box logic
        // ============================================================
        const contactForm = document.getElementById('contact-form');
        const contactStatus = document.getElementById('contact-form-status');
        const contactMessage = document.getElementById('contact-message');
        const charCount = document.getElementById('contact-char-count');
        const contactSubmitBtn = document.getElementById('contact-submit-btn');

        contactMessage.addEventListener('input', () => {
            const len = contactMessage.value.length;
            charCount.textContent = `${len} / 500`;
            charCount.classList.toggle('limit', len >= 500);
        });
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const message = contactMessage.value.trim();
            if (!name || !email || !message) {
                contactStatus.textContent = "Please fill out every field.";
                contactStatus.className = "form-status error";
                return;
            }
            const normalizedEmail = email.toLowerCase();
            const bannedUser = users.find(u => u.email === normalizedEmail && u.status === 'banned');
            if (bannedUser) {
                contactStatus.textContent = "This email address is banned from contacting the site.";
                contactStatus.className = "form-status error";
                return;
            }
            contactSubmitBtn.disabled = true;
            contactSubmitBtn.querySelector('span').textContent = 'Sending…';

            await saveMessage(name, email, message);

            const result = await sendDirectEmail(name, email, message);
            if (result.sent) {
                contactStatus.textContent = "Sent straight to Kenzo's inbox — thank you!";
                contactStatus.className = "form-status success";
            } else {
                // Falls back to the visitor's email app until EmailJS is configured.
                const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
                const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
                window.location.href = `mailto:${EMAIL_RECIPIENT}?subject=${subject}&body=${body}`;
                contactStatus.textContent = "Saved — opening your email app to finish sending…";
                contactStatus.className = "form-status success";
            }
            contactForm.reset();
            charCount.textContent = '0 / 500';
            charCount.classList.remove('limit');
            setTimeout(() => {
                contactSubmitBtn.disabled = false;
                contactSubmitBtn.querySelector('span').textContent = 'Send message';
            }, 1200);
        });