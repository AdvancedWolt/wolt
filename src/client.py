import socket
import sys

def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <ip> <port>", file=sys.stderr)
        sys.exit(1)

    ip   = sys.argv[1]
    port = int(sys.argv[2])

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((ip, port))

    try:
        while True:
            line = input("")

            s.sendall((line + '\n').encode())
            print(s.recv(4096).decode(), end="")

    except (ConnectionResetError, BrokenPipeError):
        print("\n[Error: Connection lost]", file=sys.stderr)
    except KeyboardInterrupt:
        print("\n[Client shutting down]")
    finally:
        s.close()

if __name__ == '__main__':
    main()