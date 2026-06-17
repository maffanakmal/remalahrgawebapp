import { authStore } from "../../stores/auth.store.js";
import { showSuccess, showError, showInfo } from "../../helpers/alert.js";
import { rules, validate } from "../../utils/validator.js";

function getRedirectByRole(role) {
    if (!role) return "/";

    const normalizedRole = role.trim().toUpperCase();

    const routes = {
        ADMIN: "/admin",
        GA: "/ga",
        HR: "/hr",
        WAREK3: "/warek3",
        DIREKTUR: "/direktur",
    };

    return routes[normalizedRole] || "/";
}

function setFieldError(form, fieldName, message) {
    const errorEl = form.querySelector(`[data-error="${fieldName}"]`);
    if (!errorEl) return;

    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
}

function clearFieldError(form, fieldName) {
    const errorEl = form.querySelector(`[data-error="${fieldName}"]`);
    if (!errorEl) return;

    errorEl.textContent = "";
    errorEl.classList.add("hidden");
}

function clearAllFieldErrors(form) {
    form.querySelectorAll("[data-error]").forEach((el) => {
        el.textContent = "";
        el.classList.add("hidden");
    });
}

function setLoading(loginBtn, isLoading) {
    loginBtn.disabled = isLoading;

    if (isLoading) {
        loginBtn.dataset.originalText =
            loginBtn.dataset.originalText || loginBtn.textContent;
        loginBtn.textContent = "Memproses...";
    } else {
        loginBtn.textContent = loginBtn.dataset.originalText || "Masuk";
    }
}

function getLoginErrorMessage(error) {
    if (error?.code === "ACCOUNT_LOCKED") {
        return "Akun Anda telah dikunci karena terlalu banyak upaya login yang gagal.";
    }

    if (error?.code === "INVALID_CREDENTIALS") {
        return "Email atau password salah.";
    }

    if (error?.code === "ACCOUNT_INACTIVE") {
        return "Akun Anda tidak aktif.";
    }

    if (error instanceof TypeError) {
        return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
    }

    return error?.message || "Terjadi kesalahan, coba lagi nanti.";
}

function initLogin() {
    const form = document.getElementById("loginForm");
    const loginBtn = document.getElementById("loginBtn");

    if (!form || !loginBtn) return;

    if (form.dataset.initialized === "true") return;
    form.dataset.initialized = "true";

    form.addEventListener("input", (e) => {
        const target = e.target;

        if (!target?.name) return;

        clearFieldError(form, target.name);
    });

    // Submit Login
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (loginBtn.disabled) return;

        clearAllFieldErrors(form);

        const data = {
            email: form.email.value.trim(),
            password: form.password.value,
        };

        const { valid, errors } = validate(data, {
            email: [
                rules.required("Email"),
                rules.email("Email"),
            ],
            password: [
                rules.required("Password"),
                rules.minLength(6, "Password"),
            ],
        });

        if (!valid) {
            Object.keys(errors).forEach((fieldName) => {
                setFieldError(form, fieldName, errors[fieldName]);
            });

            return;
        }

        setLoading(loginBtn, true);

        try {
            showInfo("Mengautentikasi...", "Proses Login");

            await authStore.login(data.email, data.password);

            showSuccess("Login berhasil! Mengalihkan...", "Login Berhasil");

            const userRole = authStore.getUser()?.role;

            window.location.href = getRedirectByRole(userRole);

            return;
        } catch (error) {
            showError(getLoginErrorMessage(error), "Gagal Login");
            setLoading(loginBtn, false);
        }
    });
}

initLogin();

document.addEventListener("DOMContentLoaded", initLogin);