# 2026-01-07 Development Summary

## Initial Focus: Mobile UX Refinement (Morning Session)
*   **Goal**: Refine mobile interactions and visual polish.
*   **Key Changes**:
    *   **Glassmorphism**: Applied `backdrop-blur` and semi-transparent backgrounds to `Sidebar`, `NoteEditor`, and `DateTimePicker`.
    *   **Sidebar Navigation**: Moved from a top-bar heavy design to a slide-over Sidebar for filtering (All, Today, Upcoming, Completed).
    *   **Animations**: Removed `LayoutGroup` causing "auto-scroll" bugs. Implemented `AnimatePresence` for smooth list filtering.
    *   **Mobile Date Picker**: Replaced native browser picker with an iOS-style bottom sheet picker (`react-mobile-picker`).
    *   **Branding**: Added "Tiga" Logo (Check circle icon).
    *   **iOS Fixes**: Added `padding-top: env(safe-area-inset-top)` for status bar clearance.

## Session 2: Transformation to "Note App" (Evening Session)
*   **Goal**: Pivot from a simple Todo list to a "Task-first Note App" with rich text capabilities.
*   **Key Changes**:
    1.  **"Flow" Editor (Tiptap Integration)**:
        *   Replaced the old `Textarea` + `ReactMarkdown` toggle with a seamless **WYSIWYG Tiptap Editor**.
        *   Supports live Markdown rendering (Headers, Lists, Bold) and Task Lists.
        *   Added a mobile-friendly formatting toolbar.
    2.  **Bottom Navigation & Views**:
        *   Implemented a Glass-morphic **Bottom Navigation Bar** with "Tasks" and "Notes" tabs.
        *   **Tasks View**: The classic checklist view.
        *   **Notes View**: A new **Masonry/Grid** layout to visualize content-rich items as cards.
    3.  **Adaptive UX**:
        *   **Context-Aware FAB**:
            *   *In Tasks*: Shows `+` -> Opens **Quick Input** bar.
            *   *In Notes*: Shows `Pen` -> Instantly opens **Full Editor**.
        *   **Smart Input**: Added a "Maximize" `⤢` button to the Quick Input bar to escalate a task into a full note.
    4.  **Animation Polish**:
        *   **Fixed Layout Shift**: Solved mobile "jerkiness" during tab switching by stabilizing the container height and using `relative/absolute` positioning correctly.
        *   **Spring Physics**: Applied premium "Pop" animations (`type: spring`, `stiffness: 350`) to note cards with staggered entry delays.

## Next Steps
*   **Sidebar 2.0**: Refactor Sidebar to support **Projects/Lists** (e.g., "Work", "Personal") instead of just date filters.
*   **Backend Support**: Add `lists` table and relationships.
*   **Refine Notes**: Filter "Notes" view to exclude empty tasks.
