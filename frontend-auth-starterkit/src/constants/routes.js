export const ROUTES = {
  Home: {
    name: "Home",
    icon: "fa-solid fa-home",
    path: "/",
  },
  Login: {
    name: "Login",
    icon: "",
    path: "/auth/login",
  },
  Register: {
    name: "Register",
    icon: "",
    path: "/auth/register",
  },
  Forms: {
    name: "Forms",
    icon: "",
    children: {
      BelanjaBulanan: {
        name: "Belanja Bulanan",
        icon: "fa-solid fa-basket-shopping",
        path: "/forms/belanjabulanan"
      },
    }
  },
  BerandaGA: {
    name: "Beranda",
    icon: "fa-solid fa-home",
    path: "/ga",
  },
  Pengajuan: {
    name: "Pengajuan",
    icon: "fa-solid fa-file-circle-plus",
    children: {
      BelanjaBulanan: {
        name: "Belanja Bulanan",
        icon: "fa-solid fa-basket-shopping",
        path: "/ga/belanjabulanan"
      },
      InventoryKendaraan: {
        name: "Inventory Kendaraan",
        icon: "fa-solid fa-car",
        path: "/ga/inventorykendaraan"
      },
    }
  },
  FormPengajuan: {
    name: "Form Pengajuan",
    icon: "fa-solid fa-file-circle-plus",
    children: {
      BelanjaBulananCreate: {
        name: "Form Belanja Bulanan",
        icon: "fa-solid fa-basket-shopping",
        path: "/ga/belanjabulanan/create"
      },
      InventoryKendaraanCreate: {
        name: "Form Inventory Kendaraan",
        icon: "fa-solid fa-car",
        path: "/ga/inventorykendaraan/create"
      },
    }
  },
  BerandaHR: {
    name: "Beranda",
    icon: "fa-solid fa-home",
    path: "/hr",
  },
};