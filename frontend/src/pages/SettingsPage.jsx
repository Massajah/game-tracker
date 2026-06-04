import { useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

const mainPlatforms = [
    "PC",
    "PlayStation 5",
    "PlayStation 4",
    "Xbox Series X/S",
    "Xbox One",
    "Nintendo Switch",
    "iOS",
    "Android",
    "Nintendo 3DS",
    "Linux",
];

const extraPlatforms = [
    "macOS",
    "Nintendo DS",
    "Nintendo DSi",
    "Xbox 360",
    "Xbox",
    "PlayStation 3",
    "PlayStation 2",
    "PlayStation",
    "PS Vita",
    "PSP",
    "Wii U",
    "Wii",
    "GameCube",
    "Nintendo 64",
    "Game Boy Advance",
    "Game Boy Color",
    "Game Boy",
    "SNES",
    "NES",
    "Classic Macintosh",
    "Apple II",
    "Commodore / Amiga",
    "Atari 7800",
    "Atari 5200",
    "Atari 2600",
    "Atari Flashback",
    "Atari 8-bit",
    "Atari ST",
    "Atari Lynx",
    "Atari XEGS",
    "Genesis",
    "SEGA Saturn",
    "SEGA CD",
    "SEGA 32X",
    "SEGA Master System",
    "Dreamcast",
    "3DO",
    "Jaguar",
    "Game Gear",
    "Neo Geo",
    "Web"
];
function SettingsPage({
    theme,
    setTheme,
    resultsPerPage,
    setResultsPerPage,
    sortMode,
    setSortMode,
    selectedPlatforms,
    setSelectedPlatforms,
    searchOwnedPlatformsOnly,
    setSearchOwnedPlatformsOnly,
    user,
    setUser,
}) {

    const [username, setUsername] = useState(user?.username || "");
    const [profileMessage, setProfileMessage] = useState(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [showMorePlatforms, setShowMorePlatforms] = useState(false);

    const visiblePlatforms = showMorePlatforms
        ? [...mainPlatforms, ...extraPlatforms]
        : mainPlatforms;

    const togglePlatform = (platform) => {
        setSelectedPlatforms((prev) =>
            prev.includes(platform)
                ? prev.filter((p) => p !== platform)
                : [...prev, platform]
        );
    };

    const handleSaveUsername = async () => {
        try {
            setIsSavingProfile(true);
            setProfileMessage(null);

            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/auth/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        username,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setProfileMessage({
                    type: "error",
                    text: data.error || "Failed to update username.",
                });
                return;
            }

            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);

            setProfileMessage({
                type: "success",
                text: "Username updated successfully.",
            });

            setTimeout(() => {
                setProfileMessage(null);
            }, 3000);

        } catch {
            setProfileMessage({
                type: "error",
                text: "Something went wrong. Please try again.",
            });

            setTimeout(() => {
                setProfileMessage(null);
            }, 5000);

        } finally {
            setIsSavingProfile(false);
        }
    };

    return (
        <main className="settings-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">
                        Manage your preferences and search options.
                    </p>
                </div>
            </div>

            <section className="settings-card">
                <h2>Profile</h2>
                <p>Update your username.</p>

                <div className="settings-profile-form">
                    <input
                        className="settings-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                    />

                    <button
                        className="settings-save-button"
                        onClick={handleSaveUsername}
                        disabled={isSavingProfile}
                    >
                        {isSavingProfile ? "Saving..." : "Save"}
                    </button>
                </div>

                <div className="settings-message-container">
                    {profileMessage && (
                        <div className={`settings-message ${profileMessage.type}`}>
                            {profileMessage.text}
                        </div>
                    )}
                </div>
            </section>

            <section className="settings-card">
                <h2>Appearance</h2>
                <p>Choose how GameTracker looks.</p>

                <div className="settings-theme-options">
                    <button
                        className={`settings-theme-button ${theme === "light" ? "active" : ""
                            }`}
                        onClick={() => setTheme("light")}
                    >
                        <FiSun />
                        Light
                    </button>

                    <button
                        className={`settings-theme-button ${theme === "dark" ? "active" : ""
                            }`}
                        onClick={() => setTheme("dark")}
                    >
                        <FiMoon />
                        Dark
                    </button>
                </div>
            </section>

            <section className="settings-card">
                <h2>Platforms</h2>
                <p>Choose the platforms you own.</p>

                <div className="platform-grid">
                    {visiblePlatforms.map((platform) => (
                        <label key={platform} className="platform-option">
                            <input
                                type="checkbox"
                                checked={selectedPlatforms.includes(platform)}
                                onChange={() => togglePlatform(platform)}
                            />
                            <span>{platform}</span>
                        </label>
                    ))}
                </div>
                <button
                    type="button"
                    className="settings-secondary-button"
                    onClick={() => setShowMorePlatforms((prev) => !prev)}
                >
                    <span>{showMorePlatforms ? "Show less platforms" : "Show more platforms"}</span>
                    <span className="settings-secondary-icon">
                        {showMorePlatforms ? "▲" : "▼"}
                    </span>
                </button>
            </section>

            <section className="settings-card">
                <h2>Search</h2>
                <p>Customize how search results are displayed.</p>

                <div className="settings-group">
                    <h3>Results shown</h3>

                    <label>
                        <input
                            type="radio"
                            name="resultsPerPage"
                            value="10"
                            checked={resultsPerPage === 10}
                            onChange={() => setResultsPerPage(10)}
                        />
                        10 results
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="resultsPerPage"
                            value="20"
                            checked={resultsPerPage === 20}
                            onChange={() => setResultsPerPage(20)}
                        />
                        20 results
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="resultsPerPage"
                            value="30"
                            checked={resultsPerPage === 30}
                            onChange={() => setResultsPerPage(30)}
                        />
                        30 results
                    </label>
                </div>

                <div className="settings-group">
                    <h3>Sort results by</h3>

                    <label>
                        <input
                            type="radio"
                            name="sortMode"
                            value="popularity"
                            checked={sortMode === "popularity"}
                            onChange={() => setSortMode("popularity")}
                        />
                        Popularity
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="sortMode"
                            value="name"
                            checked={sortMode === "name"}
                            onChange={() => setSortMode("name")}
                        />
                        Name
                    </label>
                </div>

                <label className="settings-checkbox-row">
                    <input
                        type="checkbox"
                        checked={searchOwnedPlatformsOnly}
                        onChange={(e) => setSearchOwnedPlatformsOnly(e.target.checked)}
                    />
                    <span>Search only games available on my platforms</span>
                </label>
            </section>
        </main>
    );
}

export default SettingsPage;