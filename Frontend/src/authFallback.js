const LOCAL_USERS_KEY = "local_auth_users";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

export function getLocalAuthUsers() {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function setLocalAuthUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

export function createLocalAuthUser(payload) {
  const users = getLocalAuthUsers();
  const email = normalizeEmail(payload.email);
  const exists = users.some((u) => normalizeEmail(u.email) === email);
  if (exists) {
    return { ok: false, error: "Email already exists." };
  }

  const nextUser = {
    _id: Date.now(),
    id: Date.now(),
    firstName: payload.firstName || "User",
    lastName: payload.lastName || "",
    email,
    password: String(payload.password || ""),
    phoneNumber: payload.phoneNumber || null,
    imageUrl: payload.imageUrl || null,
    source: "local-fallback",
  };
  setLocalAuthUsers([...users, nextUser]);
  return { ok: true, user: nextUser };
}

export function loginWithLocalAuth(email, password) {
  const users = getLocalAuthUsers();
  const normalized = normalizeEmail(email);
  const user = users.find(
    (u) => normalizeEmail(u.email) === normalized && String(u.password || "") === String(password || "")
  );
  if (!user) return null;
  return { ...user, _id: user._id ?? user.id, id: user.id ?? user._id };
}

