import socket
import sys

def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <ip> <port>", file=sys.stderr)
        sys.exit(1)

    ip   = sys.argv[1]
    port = int(sys.argv[2])

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.connect((ip, port))
        reader = sock.makefile('r')   # line-buffered reader over the same socket

        try:
            while True:
                # Read one command from the user (blocking)
                line = input()

                # Send to server (server expects \n-terminated lines)
                sock.sendall((line + '\n').encode())

                # Wait for exactly one response line, then print it
                response = reader.readline()
                if not response:
                    break
                print(response, end='')

        except (ConnectionResetError, BrokenPipeError):
            print("\n[Connection lost]", file=sys.stderr)

if __name__ == '__main__':
    main()