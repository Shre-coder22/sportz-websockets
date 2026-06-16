import { WebSocket,  WebSocketServer } from "ws";
import { wsArcjet } from "../arcjet";

const sendJson = (socket, payload) => {
    if(socket.readyState !==  WebSocket.OPEN) return;

    socket.send(JSON.stringify(payload));
}

const broadcast = (wss, payload) => {
    for (const client of wss.clients) {
        sendJson(client, payload);
    }
}

export const attachWebSocketServer = (server) => {
    const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 1024 * 1024 });

    wss.on('connection', async(socket, req) => {
        if(wsArcjet){
            try {
                const decision = await wsArcjet.protect(req);
                
                if(decision.isDenied()){
                    const code = decision.reason.isRateLimit() ? 1013 : 1008;
                    const reason = decision.reason.isRateLimit() ? 'Rate limit exceeded' : 'Access Denied';
                                
                    socket.close(code, reason);
                    return;
                }    
            } catch (error) {
                console.error(error);
                socket.close(code, reason);
                return;
            }
        }


        socket.isAlive = true;
        socket.on('pong', () => { socket.isAlive = true; });

        sendJson(socket, {type: 'welcome'});

        socket.on('error', console.error);
    })

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if(!ws.isAlive) return ws.terminate();

            ws.isAlive = false;
            ws.ping();
        })
    }, 30000);

    wss.on('close', () => clearInterval(interval));

    const broadcastMatchCreated = (match) => {
        broadcast(wss, { type: 'match_created', data: match });
    }

    return {broadcastMatchCreated};
}
