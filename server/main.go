package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"github.com/prkshayush/ai-taskmanager/db"
	"github.com/prkshayush/ai-taskmanager/routes"
)

func main() {
	err := godotenv.Load()
	if err != nil{
		log.Fatal("Error loading env file")
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

	routes.Routes(app)

	app.Listen(":" + port)
}