import ws from 'ws'
import { Connection, ConnectionHandler } from './SocketServerConnection'

export class SocketServer {
    port: number
    wss: ws.Server | null
    connections: Connection[]
    CONN_ID: number

    constructor(port: number) {
        this.port = port
        this.wss = null
        this.connections = []
        this.CONN_ID = 0
    }

    start(): void {
        this.wss = new ws.Server({ port: this.port })

        this.wss.on('connection', (socket, req) => {
            this.CONN_ID++
            const ip = req.connection.remoteAddress
            console.log(`WebSocket aperto (IP: ${ip})`)

            const conn = new Connection({
                socket: socket,
                id: this.CONN_ID
            })
            conn.handler = this.makeConnectionHandler(conn)
            this.connections.push(conn)
            console.log(`Nuova connessione: ${conn.id}`)

            socket.on('close', () => {
                const index = this.connections.findIndex(c => c.id === conn.id)
                if (index >= 0) {
                    this.connections.splice(index, 1)
                }
                console.log(`Connessione ${conn.id} terminata`)
            })
        })
    }

    makeConnectionHandler(conn: Connection): ConnectionHandler {
        return new ConnectionHandler(conn)
    }

    broadcast(name: string, payload?: any): void {
        console.log('Broadcast di ', name, payload)
        this.connections.forEach(conn => conn.sendMessage(name, payload))
    }
}
