package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/prkshayush/ai-taskmanager/auth"
	"github.com/prkshayush/ai-taskmanager/handlers"
	"github.com/prkshayush/ai-taskmanager/middleware"
	"github.com/prkshayush/ai-taskmanager/services"
)

func Routes(app *fiber.App) {
	// auth routes
	app.Post("/register", auth.Register)
	app.Post("login", auth.Login)
	
	// dashboard routes
	api := app.Group("/api", middleware.Protected())
	api.Post("/task", handlers.CreateTask)
	api.Get("/tasks", handlers.GetTasks)
	api.Put("/task/:id", handlers.UpdateTask)
	api.Delete("/task/:id", handlers.DeleteTask)
	api.Post("/task/:id/assign", handlers.AssignTask)
	api.Put("/tasks/:id/status", handlers.UpdateTaskStatus)

	// websocket route
	app.Get("/ws", websocket.New(func (c *websocket.Conn) {
		services.WS.AddClient(c)
		defer services.WS.RemoveClient(c)

		for {
			_, _, err := c.ReadMessage()
			if err != nil {
				break
			}
		}
	}))
	

}