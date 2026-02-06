"""
Logging configuration for debugging tool calling issues.
Import this early in main.py to setup comprehensive logging.
"""
import logging
import sys
from pathlib import Path
from datetime import datetime


def setup_debug_logging():
    """Setup comprehensive logging for debugging."""
    # Create logs directory
    logs_dir = Path(__file__).parent.parent / "logs"
    logs_dir.mkdir(exist_ok=True)

    # Create timestamped log filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = logs_dir / f"debug_{timestamp}.log"

    # Configure root logger
    log_format = '%(asctime)s [%(name)s] %(levelname)s: %(message)s'

    # File handler with all logs
    file_handler = logging.FileHandler(log_file, encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(logging.Formatter(log_format))

    # Console handler with INFO level
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(logging.Formatter(log_format))

    # Specific loggers
    loggers_config = [
        ("", logging.DEBUG),           # Root logger
        ("mcp", logging.DEBUG),        # MCP tools
        ("mcp.tools", logging.DEBUG),  # MCP tools detailed
        ("agents", logging.DEBUG),     # OpenAI Agents SDK
        ("src.agent_config", logging.DEBUG),  # Agent factory
        ("src.routers.chat", logging.DEBUG), # Chat endpoint
        ("uvicorn", logging.INFO),     # Uvicorn (HTTP server)
        ("uvicorn.access", logging.INFO),  # Access logs
        ("httpx", logging.WARNING),    # HTTP client
        ("httpcore", logging.WARNING), # HTTP core
    ]

    for logger_name, level in loggers_config:
        logger = logging.getLogger(logger_name)
        logger.setLevel(level)

        # Remove existing handlers to avoid duplicates
        logger.handlers.clear()

        # Add handlers
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)

    # Prevent propagation to root to avoid duplicate messages
    logging.getLogger("mcp").propagate = False
    logging.getLogger("mcp.tools").propagate = False
    logging.getLogger("agents").propagate = False

    # Log startup message
    logger = logging.getLogger(__name__)
    logger.info("=" * 60)
    logger.info("DEBUG LOGGING ENABLED")
    logger.info(f"Log file: {log_file}")
    logger.info("=" * 60)


def get_log_file_path() -> Path:
    """Get the path to the most recent debug log file."""
    logs_dir = Path(__file__).parent.parent / "logs"
    if not logs_dir.exists():
        return logs_dir

    log_files = list(logs_dir.glob("debug_*.log"))
    if not log_files:
        return logs_dir

    # Return the most recently modified log file
    return max(log_files, key=lambda f: f.stat().st_mtime)
