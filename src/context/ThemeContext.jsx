import { createContext, useState, useEffect, useContext } from 'react';
// app-theme -> darkgreen (Midnight Aqua) , purple (Royal Sunshine) , darkvoilet (Dark Floral Fusion)
const THEMES = ["darkgreen", "purple", "darkvoilet"];

const ThemeContext = createContext(undefined);
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem("app-theme") || "darkgreen");

    useEffect(() => {
        const body = document.body;
        THEMES.forEach((t) => body.classList.remove(t));
        body.classList.add(theme);
        localStorage.setItem("app-theme", theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};