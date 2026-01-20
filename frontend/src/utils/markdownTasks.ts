/**
 * Parse markdown task lists from document content
 * Matches - [ ] and - [x] / - [X] task list syntax
 */

export interface ParsedTask {
    lineIndex: number;
    text: string;
    isCompleted: boolean;
}

/**
 * Parse markdown task lists from content
 * @param content - The markdown document content
 * @returns Array of parsed tasks with line index, text, and completion status
 */
export function parseMarkdownTasks(content: string): ParsedTask[] {
    if (!content) return [];

    const tasks: ParsedTask[] = [];
    const lines = content.split('\n');

    // Regex to match markdown task list items:
    // - [ ] task text (incomplete)
    // - [x] task text (completed)
    // - [X] task text (completed, uppercase X)
    // Use .* to capture any text (including empty), then filter
    const taskRegex = /^\s*-\s*\[([ xX])\]\s*(.*)$/;

    lines.forEach((line, index) => {
        const match = line.match(taskRegex);
        if (match) {
            const text = match[2].trim();
            // Skip empty tasks (no text content)
            if (!text) return;
            
            const isCompleted = match[1].toLowerCase() === 'x';
            tasks.push({
                lineIndex: index,
                text,
                isCompleted
            });
        }
    });

    return tasks;
}

/**
 * Update a task's completion status in markdown content
 * @param content - The original markdown content
 * @param lineIndex - The line index of the task to update
 * @param completed - Whether the task should be completed
 * @returns Updated markdown content
 */
export function updateMarkdownTask(content: string, lineIndex: number, completed: boolean): string {
    if (!content) return '';

    const lines = content.split('\n');

    if (lineIndex < 0 || lineIndex >= lines.length) {
        return content;
    }

    const line = lines[lineIndex];
    const taskRegex = /^\s*-\s*\[([ xX])\]\s*(.+)$/;
    const match = line.match(taskRegex);

    if (!match) {
        return content;
    }

    const checkbox = completed ? '[x]' : '[ ]';
    const text = match[2].trim();

    // Preserve leading whitespace and the dash
    const leadingWhitespace = line.match(/^\s*/)?.[0] || '';
    lines[lineIndex] = `${leadingWhitespace}- ${checkbox} ${text}`;

    return lines.join('\n');
}

/**
 * Check if content contains any non-empty task lists
 */
export function hasMarkdownTasks(content: string): boolean {
    if (!content) return false;
    // Only match tasks with actual text content (not just whitespace)
    const taskRegex = /^\s*-\s*\[([ xX])\]\s*\S+.*$/m;
    return taskRegex.test(content);
}
