import { authStore } from "../../stores/auth.store.js";
import { showSuccess, showError, showInfo } from "../../helpers/alert.js";
import { rules, validate } from "../../utils/validator.js";

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

function setLoading(registerBtn, isLoading) {
    registerBtn.disabled = isLoading;

    if (isLoading) {
        registerBtn.dataset.originalText =
            registerBtn.dataset.originalText || registerBtn.textContent;
        registerBtn.textContent = "Memproses...";
    } else {
        registerBtn.textContent = registerBtn.dataset.originalText || "Daftar";
    }
}

function getRegisterErrorMessage(error) {
    if (error instanceof TypeError) {
        return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
    }

    if (error?.code === "EMAIL_TAKEN") {
        return "Email sudah terdaftar, silakan gunakan email lain.";
    }

    if (error?.code === "USERNAME_TAKEN") {
        return "Username sudah digunakan oleh orang lain.";
    }

    if (error?.code === "WEAK_PASSWORD") {
        return "Password terlalu lemah.";
    }

    return error?.message || "Terjadi kesalahan, coba lagi nanti.";
}
function initRegister() {
    const form = document.getElementById("registerForm");
    const registerBtn = document.getElementById("registerBtn");

    if (!form || !registerBtn) return;

    // Hindari event listener terpasang berulang kali
    if (form.dataset.initialized === "true") return;
    form.dataset.initialized = "true";

    // Hapus error saat user mengetik
    form.addEventListener("input", (e) => {
        const target = e.target;

        if (!target?.name) return;

        clearFieldError(form, target.name);
    });

    // Submit Register
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Cegah double submit
        if (registerBtn.disabled) return;

        clearAllFieldErrors(form);

        const data = {
            username: form.username.value.trim(),
            email: form.email.value.trim(),
            password: form.password.value,
            confirmPassword: form.confirmPassword.value,
        };

        const { valid, errors } = validate(data, {
            username: [
                rules.required("Username"),
                rules.minLength(5, "Username"),
                rules.maxLength(50, "Username"),
            ],
            email: [
                rules.required("Email"),
                rules.email("Email"),
            ],
            password: [
                rules.required("Password"),
                rules.minLength(6, "Password"),
                rules.passwordStrength("Password"),
            ],
            confirmPassword: [
                rules.required("Konfirmasi Password"),
                rules.confirmedPassword(data.password, "Konfirmasi Password"),
            ],
        });

        if (!valid) {
            Object.keys(errors).forEach((fieldName) => {
                setFieldError(form, fieldName, errors[fieldName]);
            });

            return;
        }

        setLoading(registerBtn, true);

        try {
            showInfo("Membuat akun baru Anda...", "Proses Pendaftaran");

            await authStore.register(data.username, data.email, data.password);

            showSuccess("Akun berhasil dibuat! Mengalihkan...", "Pendaftaran Berhasil");

            window.location.href = "/auth/login";

            return;
        } catch (error) {
            showError(getRegisterErrorMessage(error), "Gagal Mendaftar");
            setLoading(registerBtn, false);
        }
    });
}

initRegister();

document.addEventListener("DOMContentLoaded", initRegister);