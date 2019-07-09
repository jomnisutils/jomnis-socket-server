import ws from "ws"
import { Connection, ConnectionHandler } from "./SocketServerConnection"

export class SocketServer {
    private port: number
    private wss: ws.Server | null
    private connections: Connection[]
    private CONN_ID: number

    public constructor(port: number) {
        this.port = port
        this.wss = null
        this.connections = []
        this.CONN_ID = 0
    }

    public start(): void {
        this.wss = new ws.Server({ port: this.port })

        this.wss.on("connection", (socket, req): void => {
            this.CONN_ID++
            const ip = req.connection.remoteAddress
            console.log(`WebSocket aperto (IP: ${ip})`)

            const conn = new Connection({
                socket: socket,
                id: this.CONN_ID,
            })
            conn.handler = this.makeConnectionHandler(conn)
            this.connections.push(conn)
            console.log(`Nuova connessione: ${conn.id}`)

            socket.on("close", (): void => {
                const index = this.connections.findIndex(c => c.id === conn.id)
                if (index >= 0) {
                    this.connections.splice(index, 1)
                }
                console.log(`Connessione ${conn.id} terminata`)
            })
        })
    }

    public makeConnectionHandler(conn: Connection): ConnectionHandler {
        return new ConnectionHandler(conn)
    }

    public broadcast(name: string, payload?: any): void {
        console.log("Broadcast di ", name, payload)
        this.connections.forEach((conn): void => conn.sendMessage(name, payload))
    }
}
