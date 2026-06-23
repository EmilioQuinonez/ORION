export type ActionName =
    | "open_app"
    | "play_music"
    | "stop_music"
    | "get_current_track"
    | "next_track"
    | "previous_track"
    | "play_song"
    | "play_artist"
    | "play_playlist"
    | "get_time"
    | "get_date"
    | "search_web"
    | "open_youtube"
    | "volume_up"
    | "volume_down"
    | "volume_mute"
    | "screenshot"
    | "lock_screen"
    | "open_terminal"
    | "open_finder"
    | "open_settings"
    | "open_calendar"
    | "open_mail"
    | "open_notes"
    | "open_browser"
    | "open_maps"
    | "get_battery"
    | "general_question";

export const ALLOWED_ACTIONS = new Set<ActionName>([
    "open_app",
    "play_music",
    "stop_music",
    "get_current_track",
    "next_track",
    "previous_track",
    "play_song",
    "play_artist",
    "play_playlist",
    "get_time",
    "get_date",
    "search_web",
    "open_youtube",
    "volume_up",
    "volume_down",
    "volume_mute",
    "screenshot",
    "lock_screen",
    "open_terminal",
    "open_finder",
    "open_settings",
    "open_calendar",
    "open_mail",
    "open_notes",
    "open_browser",
    "open_maps",
    "get_battery",
    "general_question",
]);

export const SAFE_APPS = new Set([
    "Apple Music",
    "Music",
    "Safari",
    "Google Chrome",
    "Firefox",
    "Terminal",
    "Finder",
    "Calendar",
    "Mail",
    "Notes",
    "Maps",
    "Photos",
    "Messages",
    "FaceTime",
    "App Store",
    "System Preferences",
    "System Settings",
    "Xcode",
    "Visual Studio Code",
    "Slack",
    "Spotify",
    "Discord",
    "Zoom",
    "Notion",
    "Bear",
    "Things",
    "Obsidian",
]);

export function isAllowedAction(action: string): action is ActionName {
    return ALLOWED_ACTIONS.has(action as ActionName);
}

export function isSafeApp(appName: string): boolean {
    const normalized = appName.trim();
    return SAFE_APPS.has(normalized);
}
