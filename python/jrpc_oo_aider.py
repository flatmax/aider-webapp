#!/usr/bin/env python

import argparse
import asyncio
from datetime import datetime
from jrpc_oo import JRPCServer
from io_wrapper import IOWrapper

from aider.main import main


def parse_args():
    # Create a parser that will extract the port argument
    parser = argparse.ArgumentParser(description="Run Aider with JSON-RPC server")
    parser.add_argument("--port", type=int, default=9000, help="Port for JSON-RPC server")
    
    # Parse known args to get the port
    args, unknown_args = parser.parse_known_args()
    
    # Return both the parsed args (containing port) and the remaining args for Aider
    return args, unknown_args

async def main_starter():
    # Parse command line arguments for the server and get remaining args for Aider
    args, aider_args = parse_args()
    
    # Initialize the server
    jrpc_server = JRPCServer(port=args.port)
    
    # Start aider in API mode and get the coder instance
    coder = main(aider_args, return_coder=True)
    # Add the coder instance directly to the server with explicit class name
    jrpc_server.add_class(coder, 'EditBlockCoder')
    # Add the coder's commands to the server
    jrpc_server.add_class(coder.commands, 'Commands')
    
    # Create an IOWrapper to intercept coder IO and commands output
    try:
        io_wrapper = IOWrapper(coder.io)
        jrpc_server.add_class(io_wrapper, 'IOWrapper')
        print(f"IO wrapper created successfully: {io_wrapper}")
        # Log information about the server
        log_timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')
        
        # Make sure log file is created and accessible
        with open('/tmp/io_wrapper.log', 'w') as f:
            f.write(f"[{log_timestamp}] IO Wrapper log initialized\n")
            f.write(f"JRPC Server: {jrpc_server}\n")
            f.write(f"Coder: {coder}\n")
            f.write(f"Server methods: {dir(jrpc_server)}\n")
            f.write(f"IO wrapper methods: {dir(io_wrapper)}\n")
    except Exception as e:
        print(f"Error creating IO wrapper: {e}")
        # Still create a log file with error information
        with open('/tmp/io_wrapper.log', 'w') as f:
            f.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')}] Error initializing IO Wrapper: {e}\n")
        
    print(f"JSON-RPC server running on port {args.port}")
    print("Coder instance available through 'EditBlockCoder' class")
    print("CoderWrapper available for running prompts")
    print("IO wrapping enabled for LLM responses")
    print("Command output wrapping enabled")
    
    # Start server
    await jrpc_server.start()

    try:
        # Keep server running indefinitely
        await asyncio.Future()
    except KeyboardInterrupt:
        print("Server stopped by user")
    finally:
        await jrpc_server.stop()


if __name__ == "__main__":
    asyncio.run(main_starter())
