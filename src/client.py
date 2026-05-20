import socket
import sys

EXPECTED_ARGS = 3
IP_ARG_INDEX = 1
PORT_ARG_INDEX = 2

def main():
    # Validate command line arguments
    if len(sys.argv) != EXPECTED_ARGS:
        print(f"Usage: {sys.argv[0]} <ip> <port>", file=sys.stderr)
        sys.exit(1)

    ip   = sys.argv[IP_ARG_INDEX]
    port = int(sys.argv[PORT_ARG_INDEX])

    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.connect((ip, port))
            # Create a file-like wrapper for easier line-by-line reading
            reader = sock.makefile('r')

            while True:
                # Get user command
                line = input("")

                if line.lower() in ("exit", "quit"):
                    break

                sock.sendall((line + '\n').encode())

                # The server sends multiple lines, ending with an empty line (double newline).
                # We loop until we hit that empty response to ensure we've caught the whole message.
                while True:
                    response = reader.readline()
                    if not response:
                        break
                    
                    print(response, end='')
                    
                    # Protocol rule: An empty line (just '\n') signals the end of the response.
                    if not response.strip():
                        break

    except (ConnectionResetError, BrokenPipeError):
        print("\n[Error: Connection lost]", file=sys.stderr)
    except KeyboardInterrupt:
        print("\n[Client shutting down]")

if __name__ == '__main__':
    main()