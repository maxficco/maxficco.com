console.log("moo")

// light/dark mode support
const root = document.documentElement;
const btn = document.getElementById("theme-toggle");

const saved = localStorage.getItem("theme");
if (saved) {
    root.dataset.theme = saved;
} else {
    root.dataset.theme = (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    localStorage.setItem("theme", root.dataset.theme);
}

function toggleTheme() {
    const next =
        root.dataset.theme === "dark" ? "light" : "dark";

    root.dataset.theme = next;
    localStorage.setItem("theme", next);
}

btn.onclick = toggleTheme;
