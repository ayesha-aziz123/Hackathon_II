# """
# MCP Server entry point for task management tools.

# This module enables running the MCP server as a Python module:
#     python -m src.mcp_server

# The server uses stdio transport to communicate with the agent via
# the Model Context Protocol (MCP).
# """

# import logging
# import sys
# import os

# # Add parent path for imports
# sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# # Setup logging - Write to file to avoid interfering with stdio transport
# log_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "mcp_server.log")
# logging.basicConfig(
#     level=logging.DEBUG,
#     format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
#     filename=log_file,
#     filemode='a'
# )
# logger = logging.getLogger("mcp.server")

# def main():
#     """Main entry point for MCP server."""
#     # Redirect stdout/stderr to log file to keep stdio clean for MCP
#     # Save original stdout/stderr
#     # original_stdout = sys.stdout
#     # original_stderr = sys.stderr

#     # We DON'T redirect stdout because FastMCP uses it for transport (if using stdio)
#     # But we should redirect stderr to avoid pollution if not needed, or keep it for debugging
#     # For now, just logging to file is safer.

#     logger.info("=" * 60)
#     logger.info("MCP Server Starting...")
#     logger.info("=" * 60)
#     logger.info(f"Python path: {sys.path[:3]}...")
#     logger.info(f"CWD: {os.getcwd()}")

#     try:
#         # Import tools AFTER path is set
#         from src.mcp_server.tools import mcp

#         # List registered tools
#         if hasattr(mcp, '_mounted_tools'):
#             tools = mcp._mounted_tools
#             logger.info(f"Found {len(tools)} mounted tools: {list(tools.keys())}")

#         logger.info("Starting FastMCP server on stdio transport...")

#         # Run the FastMCP server
#         mcp.run()

#     except Exception as e:
#         logger.error(f"Fatal error in MCP server: {e}", exc_info=True)
#         sys.exit(1)

# if __name__ == "__main__":
#     main()







"""
MCP Server entry point for task management tools.

This module enables running the MCP server as a Python module:
    python -m src.mcp_server

The server uses stdio transport to communicate with the agent via
the Model Context Protocol (MCP).
"""

import sys
from pathlib import Path

# Import the mcp instance from the tools module
# When run from backend/ directory, need to use absolute import
try:
    from .tools import mcp
except ImportError:
    from src.mcp_server.tools import mcp

if __name__ == "__main__":
    # Run the FastMCP server
    # FastMCP handles stdio transport automatically
    mcp.run()

