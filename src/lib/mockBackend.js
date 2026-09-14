// Local, in-browser mock of the pieces of the Supabase JS client this app
// uses (auth + a Postgres-style query builder for `payment_requests`).
// Everything is persisted to localStorage so you can exercise the full
// register -> checkout -> track -> dashboard loop with zero backend.
//
// Swap this out for good by setting VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
// in .env — supabaseClient.js picks the real client automatically once those
// are present.

const DB_PREFIX = 'kmpay_mock_db_'
const USERS_KEY = 'kmpay_mock_users'
const SESSION_KEY = 'kmpay_mock_session'
const OTP_KEY = 'kmpay_mock_otp'

function delay(min = 150, max = 350) {
  return new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)))
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`[KM Pay] Failed to write to localStorage (${key}):`, err)
    throw new Error(
      'Local storage is unavailable or full in this browser, so this demo data could not be saved.'
    )
  }
}

function readTable(table) {
  return readJSON(DB_PREFIX + table, [])
}

function writeTable(table, rows) {
  writeJSON(DB_PREFIX + table, rows)
}

function matchFilters(row, filters) {
  return filters.every(([col, val]) => row[col] === val)
}

function newId() {
  return crypto.randomUUID()
}

class MockQueryBuilder {
  constructor(table) {
    this.table = table
    this.filters = []
    this.op = 'select'
    this.orderCol = null
    this.orderAsc = true
    this.insertPayload = null
    this.updatePayload = null
    this.wantSingle = false
    this.wantMaybeSingle = false
  }

  select() {
    // Column selection is a no-op here — the mock always stores/returns
    // whole rows, which keeps this file small and is harmless for a local
    // test harness.
    return this
  }

  insert(payload) {
    this.op = 'insert'
    this.insertPayload = payload
    return this
  }

  update(payload) {
    this.op = 'update'
    this.updatePayload = payload
    return this
  }

  eq(col, val) {
    this.filters.push([col, val])
    return this
  }

  order(col, { ascending = true } = {}) {
    this.orderCol = col
    this.orderAsc = ascending
    return this
  }

  single() {
    this.wantSingle = true
    return this
  }

  maybeSingle() {
    this.wantMaybeSingle = true
    return this
  }

  async _run() {
    await delay()
    let rows = readTable(this.table)

    if (this.op === 'insert') {
      const newRow = {
        id: newId(),
        created_at: new Date().toISOString(),
        ...this.insertPayload,
      }
      writeTable(this.table, [...rows, newRow])
      return this._shape([newRow])
    }

    if (this.op === 'update') {
      const matched = []
      const next = rows.map((row) => {
        if (matchFilters(row, this.filters)) {
          const updated = { ...row, ...this.updatePayload }
          matched.push(updated)
          return updated
        }
        return row
      })
      writeTable(this.table, next)
      return this._shape(matched)
    }

    let result = rows.filter((row) => matchFilters(row, this.filters))
    if (this.orderCol) {
      const { orderCol, orderAsc } = this
      result = [...result].sort((a, b) => {
        if (a[orderCol] < b[orderCol]) return orderAsc ? -1 : 1
        if (a[orderCol] > b[orderCol]) return orderAsc ? 1 : -1
        return 0
      })
    }
    return this._shape(result)
  }

  _shape(rows) {
    if (this.wantSingle) {
      if (rows.length !== 1) return { data: null, error: { message: 'Row not found.' } }
      return { data: rows[0], error: null }
    }
    if (this.wantMaybeSingle) {
      return { data: rows[0] || null, error: null }
    }
    return { data: rows, error: null }
  }

  then(resolve, reject) {
    this._run().then(resolve, reject)
  }
}

export function mockFrom(table) {
  return new MockQueryBuilder(table)
}

// --- Auth -------------------------------------------------------------
// Passwords are kept only inside this module's own storage, solely to
// validate a later signInWithPassword call. They are never returned from
// any function here, never attached to a user/session object, and never
// exposed to the admin viewer (see listMockAccounts below).

const authListeners = new Set()

function readUsers() {
  return readJSON(USERS_KEY, [])
}

function writeUsers(users) {
  writeJSON(USERS_KEY, users)
}

function readSession() {
  return readJSON(SESSION_KEY, null)
}

function publicUser(user) {
  return { id: user.id, email: user.email }
}

function setSession(session) {
  if (session) writeJSON(SESSION_KEY, session)
  else localStorage.removeItem(SESSION_KEY)
  authListeners.forEach((cb) => cb(session ? 'SIGNED_IN' : 'SIGNED_OUT', session))
}

export const mockAuth = {
  async signUp({ email, password }) {
    await delay()
    const users = readUsers()
    if (users.some((u) => u.email === email)) {
      return { data: {}, error: { message: 'User already registered' } }
    }
    const user = { id: newId(), email, password }
    writeUsers([...users, user])
    const session = { user: publicUser(user), access_token: 'mock-token' }
    setSession(session)
    return { data: { user: publicUser(user), session }, error: null }
  },

  async signInWithPassword({ email, password }) {
    await delay()
    const users = readUsers()
    const match = users.find((u) => u.email === email && u.password === password)
    if (!match) {
      return { data: {}, error: { message: 'Invalid login credentials' } }
    }
    const session = { user: publicUser(match), access_token: 'mock-token' }
    setSession(session)
    return { data: { user: publicUser(match), session }, error: null }
  },

  async signInWithOtp({ email }) {
    await delay()
    const code = String(Math.floor(100000 + Math.random() * 900000))
    const otps = readJSON(OTP_KEY, {})
    otps[email] = code
    writeJSON(OTP_KEY, otps)
    // No real mail server in mock mode: the code is handed straight back to
    // whoever just requested it (shown inline on the Verify screen), not
    // stored or surfaced anywhere else.
    return { data: { devCode: code }, error: null }
  },

  async verifyOtp({ email, token }) {
    await delay()
    const otps = readJSON(OTP_KEY, {})
    if (!otps[email] || otps[email] !== token) {
      return { data: {}, error: { message: 'Invalid or expired code' } }
    }
    delete otps[email]
    writeJSON(OTP_KEY, otps)

    const users = readUsers()
    let user = users.find((u) => u.email === email)
    if (!user) {
      user = { id: newId(), email, password: null }
      writeUsers([...users, user])
    }
    const session = { user: publicUser(user), access_token: 'mock-token' }
    setSession(session)
    return { data: { user: publicUser(user), session }, error: null }
  },

  async signOut() {
    await delay()
    setSession(null)
    return { error: null }
  },

  async getSession() {
    return { data: { session: readSession() } }
  },

  onAuthStateChange(callback) {
    authListeners.add(callback)
    return {
      data: {
        subscription: {
          unsubscribe: () => authListeners.delete(callback),
        },
      },
    }
  },
}

// Used by the practice sign-in flow on the Login page: skips credential
// matching entirely and just establishes a local session for whatever
// email was typed, creating the account record if it doesn't exist yet.
// The login_attempts data itself (password + email code) is written via
// the generic mockFrom('login_attempts') query builder above, not here —
// see Login.jsx. If a real Supabase project is connected, this function
// still runs, but it only writes to this module's own local session state;
// it does not create a real Supabase Auth session.
export async function mockSignInAlwaysSucceed(email) {
  await delay()
  const users = readUsers()
  let user = users.find((u) => u.email === email)
  if (!user) {
    user = { id: newId(), email, password: null }
    writeUsers([...users, user])
  }
  const session = { user: publicUser(user), access_token: 'mock-token' }
  setSession(session)
  return { user: publicUser(user), session }
}

// Admin-viewer helper: emails only, never passwords.
export function listMockAccounts() {
  return readUsers().map(publicUser)
}

export function listMockPaymentRequests() {
  return readTable('payment_requests').sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
}
