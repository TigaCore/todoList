"""
Embedded Task Parser Service

Parses Markdown content to extract checkbox tasks and update their status.
"""
import re
from typing import List, Dict

# Pattern to match Markdown checkboxes: - [ ] or - [x] or - [X] with optional text
CHECKBOX_PATTERN = re.compile(r'^(\s*[-*]\s*)\[([xX ])\]\s*(.*)$', re.MULTILINE)


def parse_embedded_tasks(content: str) -> List[Dict]:
    """
    Parse Markdown content to extract checkbox tasks.
    
    Args:
        content: Markdown content string
        
    Returns:
        List of task dicts with line_index, text, is_completed
        Note: Empty tasks (checkboxes with no text) are excluded
    """
    if not content:
        return []
    
    tasks = []
    lines = content.split('\n')
    
    for line_index, line in enumerate(lines):
        match = CHECKBOX_PATTERN.match(line)
        if match:
            checkbox_char = match.group(2)
            task_text = match.group(3).strip()
            
            # Skip empty tasks
            if not task_text:
                continue
            
            tasks.append({
                'line_index': line_index,
                'text': task_text,
                'is_completed': checkbox_char.lower() == 'x'
            })
    
    return tasks


def update_task_status(content: str, line_index: int, completed: bool) -> str:
    """
    Update the checkbox status at a specific line in the content.
    
    Args:
        content: Original Markdown content
        line_index: Zero-based line number of the task
        completed: New completion status
        
    Returns:
        Updated content string
    """
    if not content:
        return content
    
    lines = content.split('\n')
    
    if line_index < 0 or line_index >= len(lines):
        return content
    
    line = lines[line_index]
    match = CHECKBOX_PATTERN.match(line)
    
    if match:
        prefix = match.group(1)  # "- " or "* " with optional leading whitespace
        task_text = match.group(3)
        new_checkbox = '[x]' if completed else '[ ]'
        lines[line_index] = f"{prefix}{new_checkbox} {task_text}"
    
    return '\n'.join(lines)
