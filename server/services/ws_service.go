package services

import (
	"sync"

	"github.com/gofiber/websocket/v2"
)

type WSService struct {
	clients map[*websocket.Conn]bool
	mu      sync.Mutex
}

var WS = &WSService{
	clients : make(map[*websocket.Conn]bool),
}

func (ws *WSService) AddClient(c *websocket.Conn) {
	ws.mu.Lock()
	defer ws.mu.Unlock()
	ws.clients[c] = true
}

func (ws *WSService) RemoveClient(c *websocket.Conn) {
	ws.mu.Lock()
	defer ws.mu.Unlock()
	delete(ws.clients, c)
}

func (ws *WSService) BroadcastUpdate(message []byte) {
	ws.mu.Lock()
	defer ws.mu.Unlock()

	for client := range ws.clients{
		if err := client.WriteMessage(websocket.TextMessage, message); err != nil{
			ws.RemoveClient(client)
		}
	}
}