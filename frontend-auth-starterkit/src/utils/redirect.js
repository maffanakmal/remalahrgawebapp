function getRedirectByRole(role) {
    switch (role) {
        case "Admin":
            return "/admin";

        case "GA":
            return "/ga";

        case "HR":
            return "/hr";

        default:
            return "/";
    }
}