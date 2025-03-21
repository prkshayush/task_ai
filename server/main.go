package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"github.com/prkshayush/ai-taskmanager/db"
	"github.com/prkshayush/ai-taskmanager/middleware"
	"github.com/prkshayush/ai-taskmanager/routes"
)

func main() {
	if err := godotenv.Load(); err != nil {
        log.Println("Warning: .env file not found, using environment variables")
    }

	db.InitDB()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Server is up and running")
	})
    app.Use(middleware.CorsConfig())

	routes.Routes(app)

	log.Printf("Server starting on port %s", port)
    if err := app.Listen("0.0.0.0:" + port); err != nil {
        log.Fatal("Error starting server: ", err)
    }
}