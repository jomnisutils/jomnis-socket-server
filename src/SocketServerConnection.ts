import ws from 'ws'

export declare type HandlerFunction = (evData?: any) => void

export class ConnectionHandler {
    [evName: string]: HandlerFunction | Connection
    connection: Connection
    constructor(conn: Connection) {
        this.connection = conn
    }
}

export class Connection {
    id: number
    socket: ws
    handler: ConnectionHandler

    constructor(data: { socket: any; id: any; handler?: any }) {
        this.id = data.id
        this.socket = data.socket
        this.handler = data.handler

        this.socket.on('message', (message: string) => {
            const obj = JSON.parse(message)
            console.log('Ricevuto messaggio:', obj)
            // const msgData = obj.data ? JSON.parse(obj.data) : undefined
            const msgData = obj.data ? obj.data : undefined

            this.handleMessage(obj.name, msgData)
        })
    }

    sendMessage(evName: string, data?: any): void {
        console.log('Inviato: ', evName)

        this.socket.send(
            JSON.stringify({
                name: evName,
                data: data || ''
            })
        )
    }

    sendErrorMessage(message: string): void {
        this.sendMessage('evErrorMessage', { message: message })
    }

    // Gestore principali degli eventi
    handleMessage(evName: string, data: any) {
        if (this.handler[evName]) {
            const foo = <HandlerFunction>this.handler[evName]
            foo.call(this.handler, data)
        } else {
            console.log(`Nessun handler per l'evento ${evName}`)
        }
    }
}
