import ws from "ws"

export declare type HandlerFunction = (evData?: any) => void

export class ConnectionHandler {
    [evName: string]: HandlerFunction | Connection
    private connection: Connection
    public constructor(conn: Connection) {
        this.connection = conn
    }
}

export class Connection {
    public readonly id: number
    private socket: ws
    public handler: ConnectionHandler

    public constructor(data: { socket: any; id: any; handler?: any }) {
        this.id = data.id
        this.socket = data.socket
        this.handler = data.handler

        this.socket.on("message", (message: string) => {
            const obj = JSON.parse(message)
            console.log("Ricevuto messaggio:", obj)
            // const msgData = obj.data ? JSON.parse(obj.data) : undefined
            const msgData = obj.data ? obj.data : undefined

            this.handleMessage(obj.name, msgData)
        })
    }

    public sendMessage(evName: string, data?: any): void {
        console.log("Inviato: ", evName)

        this.socket.send(
            JSON.stringify({
                name: evName,
                data: data || "",
            })
        )
    }

    public sendErrorMessage(message: string): void {
        this.sendMessage("evErrorMessage", { message: message })
    }

    // Gestore principali degli eventi
    public handleMessage(evName: string, data: any): void {
        if (this.handler[evName]) {
            const foo = this.handler[evName] as HandlerFunction
            foo.call(this.handler, data)
        } else {
            console.log(`Nessun handler per l'evento ${evName}`)
        }
    }
}
