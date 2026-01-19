"""
Improved response processing for clean UI responses
This module provides helper functions to process agent responses and extract clean content for UI
"""

import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def extract_clean_response(raw_response: str) -> str:
    """
    Extract clean, meaningful response from raw agent output.

    Args:
        raw_response: Raw response from the AI agent that may contain internal processing

    Returns:
        str: Clean, user-friendly response
    """
    if not raw_response:
        return ""

    # Start with the raw response
    clean_text = raw_response

    # Remove the user ID and internal metadata that appears at the beginning
    # Pattern: UUID followed by common internal processing terms
    # Remove user ID and internal processing terms
    uuid_start = r'^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}'
    clean_text = re.sub(uuid_start, '', clean_text, flags=re.IGNORECASE)

    # Remove common internal processing artifacts - less aggressive
    patterns_to_remove = [
        r'what\'s on my list.*?pending',  # Remove internal task tracking
        r'what\'s left',  # Remove internal status tracking
        r'User says ".*?"\. We need.*?reply:',  # Remove internal instruction processing
        r'Per rules:.*?So respond with that\.',  # Remove rule processing
        r'User.*?information.*?name',  # Remove user info processing
        r'identity.*?processing',  # Remove identity processing
        r'internal.*?processing',  # Remove generic internal processing
        r'tool.*?usage.*?rules',  # Remove tool usage rules
        r'response.*?templates',  # Remove response templates
        r'formattings.*?examples',  # Remove formatting examples
        r'pending:.*?$',  # Remove pending indicators at end
        r'pending:.*?\n',  # Remove pending indicators with newline
        r'\d+[a-zA-Z0-9\-]+\!',  # Remove ID-like patterns followed by exclamation
        r'```.*?```',  # Remove code blocks
        r'\\?\'s',  # Remove escaped quotes
        r'\\?[a-zA-Z]+[a-z]+',  # Remove other escape sequences
        r'you\'re about to say something you already said.*?STOP\.',  # Remove repetition warnings
        r'The guidelines:.*?So we must output.*?So produce that\.',  # Remove internal reasoning
        r'Let\'s produce something like:.*?Add emojis:.*?\n',  # Remove internal instructions
        r'We must not include.*?So produce that\.',  # Remove internal instructions
        r'The user asked.*?The assistant responded.*?However.*?So we must.*?So produce.*?\n',  # Remove internal reasoning
        r'Content\(text=.*?type=\'reasoning_text\'\)',  # Remove reasoning content
        r'ResponseOutputText\(annotations=\[\], text=.*?type=\'output_text\',',  # Remove structured output wrappers
        r'id=\'__fake_id__\'.*?type=\'message\'\)',  # Remove fake ID wrappers
        r'__fake_id__',  # Remove fake IDs
        r'RawResponsesStreamEvent.*?type=\'raw_response_event\'',  # Remove event wrappers
        r'Event object:.*?type=\'raw_response_event\'',  # Remove event wrappers
        r'RawResponsesStreamEvent.*?sequence_number=\d+,',  # Remove event wrappers
        r'Agent\(name=.*?handoffs=\[\],',  # Remove agent info
        r'instructions=.*?prompt=None,',  # Remove instructions
        r'model_settings=.*?input_guardrails=',  # Remove model settings
        r'output_guardrails=.*?output_type=None,',  # Remove guardrail info
        r'hooks=None,.*?tool_use_behavior=',  # Remove hook info
        r'ResponseOutputMessage\(id=.*?role=\'assistant\',',  # Remove response wrappers
        r'encrypted_content=None,.*?status=None\)',  # Remove status info
        r'ResponseReasoningItem\(id=.*?type=\'reasoning\',',  # Remove reasoning items
        r'Content\(text=.*?type=\'reasoning_text\'\)',  # Remove reasoning content
        r'input_tokens=\d+,.*?total_tokens=\d+\)',  # Remove usage info
        r'usage=ResponseUsage\(.*?total_tokens=\d+\)',  # Remove usage info
        r'logprobs=.*?\)',  # Remove log probabilities
        r'annotations=\[\],',  # Remove annotation info
        r'parallel_tool_calls=False,.*?temperature=None,',  # Remove tool call info
        r'tools=\[\],.*?top_p=None,',  # Remove tool info
        r'background=None,.*?conversation=None,',  # Remove conversation info
        r'max_output_tokens=None,.*?max_tool_calls=None,',  # Remove max limits
        r'previous_response_id=None,.*?prompt=None,',  # Remove response info
        r'prompt_cache_key=None,.*?prompt_cache_retention=None,',  # Remove cache info
        r'reasoning=None,.*?safety_identifier=None,',  # Remove reasoning/safety
        r'service_tier=None,.*?status=None,',  # Remove status info
        r'text=None,.*?top_logprobs=None,',  # Remove text info
        r'truncation=None,.*?usage=',  # Remove truncation info
        r'InputTokensDetails\(cached_tokens=0\)',  # Remove token details
        r'OutputTokensDetails\(reasoning_tokens=\d+\)',  # Remove reasoning tokens
        r'Response\(id=.*?created_at=\d+\.?\d*,',  # Remove response metadata
        r'error=None,.*?incomplete_details=None,',  # Remove error details
        r'metadata=None,.*?model=.*?,',  # Remove model info
        r'object=\'response\',.*?output=\[',  # Remove response object info
        r'encrypted_content=None,.*?status=None\)',  # Remove status info
        r'role=\'assistant\',.*?status=\'completed\',',  # Remove role/status
        r'type=\'message\'\),.*?parallel_tool_calls=',  # Remove type info
        r'sequence_number=\d+,.*?type=\'response\.',  # Remove sequence info
        r'type=\'output_text\',.*?logprobs=',  # Remove output type
        r'type=\'reasoning_text\'\)',  # Remove reasoning type
    ]

    for pattern in patterns_to_remove:
        clean_text = re.sub(pattern, '', clean_text, flags=re.IGNORECASE | re.DOTALL)

    # Remove extra whitespace and clean up
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()

    # IMPROVED: Split on common separators and look for meaningful segments
    # This addresses the issue where text is concatenated like 'what's on my listwhat's leftpending...'
    separators = [
        r'what\'s on my list',
        r'what\'s left',
        r'pending',
        r'Fatima Altaf',  # User name example - should be replaced with dynamic user info
        r'How can I help with your tasks\?',
        r'How can I help',
    ]

    # Split the text based on known separators to isolate the actual response
    for sep in separators:
        parts = re.split(re.escape(sep), clean_text, flags=re.IGNORECASE)
        if len(parts) > 1:
            # Take the last part which is more likely to contain the actual response
            clean_text = parts[-1].strip()
            break

    # For simple greetings like "hi" or "hello", if they're in the clean text, return them
    # Check for simple greetings first
    simple_greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening']
    for greeting in simple_greetings:
        if greeting in clean_text.lower():
            # Extract and return the greeting with some context
            greeting_match = re.search(rf'({greeting}[^\.\!\?]*[\.!\?])', clean_text, re.IGNORECASE)
            if greeting_match:
                result = greeting_match.group(1).strip()
                result = re.sub(r'[^\w\s!.,?#\U0001f004\U0001f0cf\U0001f170-\U0001f171\U0001f17e-\U0001f17f\U0001f18e\U0001f191-\U0001f19a\U0001f201-\U0001f202\U0001f21a\U0001f22f\U0001f232-\U0001f23a\U0001f250-\U0001f251\U0001f300-\U0001f321\U0001f324-\U0001f393\U0001f396-\U0001f397\U0001f399-\U0001f39b\U0001f39e-\U0001f3f0\U0001f3f3-\U0001f3f5\U0001f3f7-\U0001f4fd\U0001f4ff-\U0001f53d\U0001f549-\U0001f54e\U0001f550-\U0001f567\U0001f56f-\U0001f570\U0001f573-\U0001f57a\U0001f587\U0001f58a-\U0001f58d\U0001f590\U0001f595-\U0001f596\U0001f5a4-\U0001f5a5\U0001f5a8\U0001f5b1-\U0001f5b2\U0001f5bc\U0001f5c2-\U0001f5c4\U0001f5d1-\U0001f5d3\U0001f5dc-\U0001f5de\U0001f5e1\U0001f5e3\U0001f5e8\U0001f5ef\U0001f5f3\U0001f5fa-\U0001f64f\U0001f680-\U0001f6d7\U0001f6dc-\U0001f6ff\U0001f774-\U0001f77f\U0001f7d5-\U0001f7ff\U0001f80c\U0001f80f\U0001f848-\U0001f84f\U0001f85a-\U0001f85f\U0001f879-\U0001f87f\U0001f88a-\U0001f8ff\U0001f900-\U0001f9ff\U0001fa60-\U0001fa6d\U0001fa70-\U0001fa74\U0001fa78-\U0001fa7a\U0001fa80-\U0001fa86\U0001fa90-\U0001faa8\U0001fab0-\U0001fab6\U0001fac0-\U0001fac2\U0001fad0-\U0001fad6\U0001fae0-\U0001fae8\U0001faf0-\U0001faf8]', ' ', result).strip()
                result = re.sub(r'\s+', ' ', result).strip()
                if len(result) > 0:
                    return result

    # Look for actual meaningful responses by searching for common response patterns
    # Priority 1: Greetings
    greeting_patterns = [
        r'Hi\s+[A-Za-z\s]+![^!.?]*(?:\.|\?|$)',
        r'Hello\s+[A-Za-z\s]+![^!.?]*(?:\.|\?|$)',
        r'Hey\s+[A-Za-z\s]+![^!.?]*(?:\.|\?|$)',
        r'Hi[^!.?]*(?:\.|\?|$)',
        r'Hello[^!.?]*(?:\.|\?|$)',
        r'Hey[^!.?]*(?:\.|\?|$)',
        r'Hi.*?How can I help with your tasks\?',
    ]

    for pattern in greeting_patterns:
        match = re.search(pattern, clean_text, re.IGNORECASE)
        if match:
            result = match.group(0).strip()
            # Clean up any remaining special characters
            result = re.sub(r'[^\w\s!.,?]', ' ', result).strip()
            result = re.sub(r'\s+', ' ', result).strip()
            if len(result) > 5:
                return result

    # Priority 2: Task-related responses
    task_patterns = [
        r'Hi.*?How can I help with your tasks\?',
        r'(?:I|I\'ve?)\s*(?:have\s*)?added.*?(?:to|in)\s*your.*?task.*?(?:list|queue)[^.!?]*[.!?]',
        r'Here are your.*?tasks[^.!?]*[.!?]',
        r'(?:Added|Created|Completed).*?task[^.!?]*[.!?]',
        r'Task.*?(?:created|added|completed|deleted)[^.!?]*[.!?]',
        r'Showing.*?tasks[^.!?]*[.!?]',
        r'All.*?tasks[^.!?]*[.!?]',
        r'✅.*?(?:added|created|completed)[^.!?]*[.!?]',
        # Task list patterns
        r'\d+️⃣.*?– pending.*?\n?\d+️⃣.*?– pending.*?\n?\d+️⃣.*?– pending',  # Multiple tasks
        r'\d+️⃣.*?– pending',  # Single task
        r'1️⃣.*?2️⃣.*?3️⃣.*?',  # Emoji task list
        r'Buy.*?clothes.*?\(.*?\)',  # Specific task pattern
        r'call.*?dad.*?\(.*?\)',  # Specific task pattern
    ]

    for pattern in task_patterns:
        match = re.search(pattern, clean_text, re.IGNORECASE)
        if match:
            result = match.group(0).strip()
            # Clean up any remaining special characters
            result = re.sub(r'[^\w\s!.,?#\u20e3\u2705\u274c\u274e\u2757\u2753-\u2754\u2763-\u2764\u2665\u2660\u2666\u2663\u2605\u2600-\u2601\u2614\u26c4-\u26c5\u26a1\u26fd\u2693\u26bd-\u26be\u26f2\u26f3\u26f5\u269b\u26f4\u26f7-\u26fa\u26ea\u26e9\u26eb-\u26ec\u26ed\u26ef\u2692-\u2694\u2696-\u2699\u269b\u269c\u26a0\u26a1\u26a7\u26aa-\u26ac\u26b0-\u26b1\u26c8\u26cf\u26d1\u26d3\u26d4\u26d8-\u26da\u26dd\u26df\u26e0-\u26e1\u26e3\u26e4\u26e7-\u26e8\u26eb-\u26ec\u26ed\u26ef\u26f0-\u26f1\u26f6\u26fb-\u26fc\u26fe-\u26ff\u2702\u2705\u2708-\u270d\u270f\u2712\u2714\u2716\u271d\u2721\u2728\u2733-\u2734\u2744\u2747\u274d\u274f-\u2752\u2756\u2758-\u275e\u2761-\u2767\u2795-\u2797\u27a1\u27b0\u27bf\u2934-\u2935\u2b05-\u2b07\u2b1b-\u2b1c\u2b50\u2b55\u3030\u303d\u3297\u3299\U0001f004\U0001f0cf\U0001f170-\U0001f171\U0001f17e-\U0001f17f\U0001f18e\U0001f191-\U0001f19a\U0001f201-\U0001f202\U0001f21a\U0001f22f\U0001f232-\U0001f23a\U0001f250-\U0001f251\U0001f300-\U0001f321\U0001f324-\U0001f393\U0001f396-\U0001f397\U0001f399-\U0001f39b\U0001f39e-\U0001f3f0\U0001f3f3-\U0001f3f5\U0001f3f7-\U0001f4fd\U0001f4ff-\U0001f53d\U0001f549-\U0001f54e\U0001f550-\U0001f567\U0001f56f-\U0001f570\U0001f573-\U0001f57a\U0001f587\U0001f58a-\U0001f58d\U0001f590\U0001f595-\U0001f596\U0001f5a4-\U0001f5a5\U0001f5a8\U0001f5b1-\U0001f5b2\U0001f5bc\U0001f5c2-\U0001f5c4\U0001f5d1-\U0001f5d3\U0001f5dc-\U0001f5de\U0001f5e1\U0001f5e3\U0001f5e8\U0001f5ef\U0001f5f3\U0001f5fa-\U0001f64f\U0001f680-\U0001f6d7\U0001f6dc-\U0001f6ff\U0001f774-\U0001f77f\U0001f7d5-\U0001f7ff\U0001f80c\U0001f80f\U0001f848-\U0001f84f\U0001f85a-\U0001f85f\U0001f879-\U0001f87f\U0001f88a-\U0001f8ff\U0001f900-\U0001f9ff\U0001fa60-\U0001fa6d\U0001fa70-\U0001fa74\U0001fa78-\U0001fa7a\U0001fa80-\U0001fa86\U0001fa90-\U0001faa8\U0001fab0-\U0001fab6\U0001fac0-\U0001fac2\U0001fad0-\U0001fad6\U0001fae0-\U0001fae8\U0001faf0-\U0001faf8]', ' ', result).strip()
            result = re.sub(r'\s+', ' ', result).strip()
            if len(result) > 5:
                return result

    # Priority 3: If no specific pattern matched, extract the most meaningful content
    # Split by common sentence endings and look for substantial content
    sentences = re.split(r'[.!?]+', clean_text)
    meaningful_sentences = []

    for sentence in sentences:
        clean_sentence = sentence.strip()
        # Clean up special characters but preserve emojis and common punctuation
        clean_sentence = re.sub(r'[^\w\s!.,?#\u20e3\u2705\u274c\u274e\u2757\u2753-\u2754\u2763-\u2764\u2665\u2660\u2666\u2663\u2605\u2600-\u2601\u2614\u26c4-\u26c5\u26a1\u26fd\u2693\u26bd-\u26be\u26f2\u26f3\u26f5\u269b\u26f4\u26f7-\u26fa\u26ea\u26e9\u26eb-\u26ec\u26ed\u26ef\u2692-\u2694\u2696-\u2699\u269b\u269c\u26a0\u26a1\u26a7\u26aa-\u26ac\u26b0-\u26b1\u26c8\u26cf\u26d1\u26d3\u26d4\u26d8-\u26da\u26dd\u26df\u26e0-\u26e1\u26e3\u26e4\u26e7-\u26e8\u26eb-\u26ec\u26ed\u26ef\u26f0-\u26f1\u26f6\u26fb-\u26fc\u26fe-\u26ff\u2702\u2705\u2708-\u270d\u270f\u2712\u2714\u2716\u271d\u2721\u2728\u2733-\u2734\u2744\u2747\u274d\u274f-\u2752\u2756\u2758-\u275e\u2761-\u2767\u2795-\u2797\u27a1\u27b0\u27bf\u2934-\u2935\u2b05-\u2b07\u2b1b-\u2b1c\u2b50\u2b55\u3030\u303d\u3297\u3299\U0001f004\U0001f0cf\U0001f170-\U0001f171\U0001f17e-\U0001f17f\U0001f18e\U0001f191-\U0001f19a\U0001f201-\U0001f202\U0001f21a\U0001f22f\U0001f232-\U0001f23a\U0001f250-\U0001f251\U0001f300-\U0001f321\U0001f324-\U0001f393\U0001f396-\U0001f397\U0001f399-\U0001f39b\U0001f39e-\U0001f3f0\U0001f3f3-\U0001f3f5\U0001f3f7-\U0001f4fd\U0001f4ff-\U0001f53d\U0001f549-\U0001f54e\U0001f550-\U0001f567\U0001f56f-\U0001f570\U0001f573-\U0001f57a\U0001f587\U0001f58a-\U0001f58d\U0001f590\U0001f595-\U0001f596\U0001f5a4-\U0001f5a5\U0001f5a8\U0001f5b1-\U0001f5b2\U0001f5bc\U0001f5c2-\U0001f5c4\U0001f5d1-\U0001f5d3\U0001f5dc-\U0001f5de\U0001f5e1\U0001f5e3\U0001f5e8\U0001f5ef\U0001f5f3\U0001f5fa-\U0001f64f\U0001f680-\U0001f6d7\U0001f6dc-\U0001f6ff\U0001f774-\U0001f77f\U0001f7d5-\U0001f7ff\U0001f80c\U0001f80f\U0001f848-\U0001f84f\U0001f85a-\U0001f85f\U0001f879-\U0001f87f\U0001f88a-\U0001f8ff\U0001f900-\U0001f9ff\U0001fa60-\U0001fa6d\U0001fa70-\U0001fa74\U0001fa78-\U0001fa7a\U0001fa80-\U0001fa86\U0001fa90-\U0001faa8\U0001fab0-\U0001fab6\U0001fac0-\U0001fac2\U0001fad0-\U0001fad6\U0001fae0-\U0001fae8\U0001faf0-\U0001faf8]', ' ', clean_sentence)
        clean_sentence = re.sub(r'\s+', ' ', clean_sentence).strip()

        # Only consider sentences that are meaningful (not just numbers or symbols)
        if len(clean_sentence) > 5 and not clean_sentence.replace(' ', '').isdigit():
            meaningful_sentences.append(clean_sentence)

    if meaningful_sentences:
        # Return the most recent meaningful sentence/content
        return meaningful_sentences[-1].strip(' .!?,:;')

    # If still no meaningful content found, clean up and return what's left
    # Allow simple responses to pass through
    clean_text = re.sub(r'[^\w\s!.,?#\U0001f004\U0001f0cf\U0001f170-\U0001f171\U0001f17e-\U0001f17f\U0001f18e\U0001f191-\U0001f19a\U0001f201-\U0001f202\U0001f21a\U0001f22f\U0001f232-\U0001f23a\U0001f250-\U0001f251\U0001f300-\U0001f321\U0001f324-\U0001f393\U0001f396-\U0001f397\U0001f399-\U0001f39b\U0001f39e-\U0001f3f0\U0001f3f3-\U0001f3f5\U0001f3f7-\U0001f4fd\U0001f4ff-\U0001f53d\U0001f549-\U0001f54e\U0001f550-\U0001f567\U0001f56f-\U0001f570\U0001f573-\U0001f57a\U0001f587\U0001f58a-\U0001f58d\U0001f590\U0001f595-\U0001f596\U0001f5a4-\U0001f5a5\U0001f5a8\U0001f5b1-\U0001f5b2\U0001f5bc\U0001f5c2-\U0001f5c4\U0001f5d1-\U0001f5d3\U0001f5dc-\U0001f5de\U0001f5e1\U0001f5e3\U0001f5e8\U0001f5ef\U0001f5f3\U0001f5fa-\U0001f64f\U0001f680-\U0001f6d7\U0001f6dc-\U0001f6ff\U0001f774-\U0001f77f\U0001f7d5-\U0001f7ff\U0001f80c\U0001f80f\U0001f848-\U0001f84f\U0001f85a-\U0001f85f\U0001f879-\U0001f87f\U0001f88a-\U0001f8ff\U0001f900-\U0001f9ff\U0001fa60-\U0001fa6d\U0001fa70-\U0001fa74\U0001fa78-\U0001fa7a\U0001fa80-\U0001fa86\U0001fa90-\U0001faa8\U0001fab0-\U0001fab6\U0001fac0-\U0001fac2\U0001fad0-\U0001fad6\U0001fae0-\U0001fae8\U0001faf0-\U0001faf8]', ' ', clean_text)
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    clean_text = clean_text.strip(' .!?,:;')

    if len(clean_text) > 200:
        clean_text = clean_text[:200] + "..."

    # Return the cleaned text even if it's simple, to avoid losing valid responses
    return clean_text.strip() if clean_text else "Okay."


def is_internal_processing(text: str) -> bool:
    """
    Check if the text contains internal processing artifacts that shouldn't be shown to user.

    Args:
        text: Text to check

    Returns:
        bool: True if text contains internal processing, False otherwise
    """
    if not text:
        return False

    internal_indicators = [
        'what\'s on my list',
        'what\'s left',
        'pending',
        'User says',
        'We need',
        'Per rules',
        'So respond with that',
        'internal',
        'processing',
        'thinking',
        'considering',
        'evaluating',
        'evaluating options',
        'considering best approach',
        'internal processing',
        'evaluating best option',
        'analyzing',
        'considering options',
    ]

    text_lower = text.lower()
    for indicator in internal_indicators:
        if indicator.lower() in text_lower:
            return True

    return False


def format_greeting_response(user_name: str) -> str:
    """
    Format a clean greeting response.

    Args:
        user_name: Name of the user

    Returns:
        str: Greeting response
    """
    return f"Hi {user_name}! How can I help with your tasks?"


def format_add_task_response(task_title: str) -> str:
    """
    Format a clean task addition response.

    Args:
        task_title: Title of the added task

    Returns:
        str: Task addition confirmation
    """
    return f"✅ Added '{task_title}' to your task list!"


def format_show_tasks_response(tasks: list) -> str:
    """
    Format tasks list response.

    Args:
        tasks: List of tasks

    Returns:
        str: Formatted tasks response
    """
    if not tasks:
        return "You don't have any pending tasks right now."

    task_list = []
    for i, task in enumerate(tasks, 1):
        if isinstance(task, dict):
            title = task.get('title', 'Unknown task')
            priority = task.get('priority', 'medium')
        else:
            title = str(task)
            priority = 'medium'

        task_list.append(f"{i}. {title} ({priority})")

    if task_list:
        return f"Here are your tasks:\n" + "\n".join(task_list)
    else:
        return "You don't have any pending tasks right now."