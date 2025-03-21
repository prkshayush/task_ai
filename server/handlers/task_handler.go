package handlers

import (
	"encoding/json"
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/prkshayush/ai-taskmanager/db"
	"github.com/prkshayush/ai-taskmanager/models"
	"github.com/prkshayush/ai-taskmanager/services"
)

func CreateTask(c *fiber.Ctx) error {
	var task models.Task
	if err := c.BodyParser(&task); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invlaid JSON",
		})
	}

	task.UserID = c.Locals("user").(int)
    if task.Status == "" {
        task.Status = models.Pending
    }

	_, err := db.DB.NamedExec(`
        INSERT INTO tasks (title, description, user_id, assigned_to, status) 
        VALUES (:title, :description, :user_id, :assigned_to, :status)
        RETURNING *`, &task)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "message": "Could not create task",
        })
    }

	var createdTask models.Task
    err = db.DB.Get(&createdTask, `SELECT * FROM tasks WHERE id = (SELECT lastval())`)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "message": "Could not fetch created task",
        })
    }

	// websocket broadcast
    update := fiber.Map{
        "type": "task_created",
        "task": createdTask,
    }
    updateBytes, _ := json.Marshal(update)
    services.WS.BroadcastUpdate(updateBytes)

    return c.Status(fiber.StatusCreated).JSON(createdTask)
}

func GetTasks(c *fiber.Ctx) error {
    userID := c.Locals("user").(int)
    var tasks []models.Task

    err := db.DB.Select(&tasks, `
        SELECT * FROM tasks 
        WHERE user_id = $1 OR assigned_to = $1
        ORDER BY created_at DESC`, userID)
    if err != nil {
        log.Printf("Error fetching tasks: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "message": "Could not get tasks",
        })
    }

    return c.JSON(tasks)
}

func UpdateTask(c *fiber.Ctx) error {
	id := c.Params("id")
	var task models.Task
	if err := c.BodyParser(&task); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid JSON",
		})
	}

	taskID, err := strconv.Atoi(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid task ID",
		})
	}

	task.ID = taskID
	task.UserID = c.Locals("user").(int)

	result, err := db.DB.NamedExec(`UPDATE tasks SET title=:title, description=:description WHERE id=:id AND user_id=:user_id`, &task)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Could not update task",
		})
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Error could not update task",
		})
	}

	if rows == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "Task not found or unauthorized",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Task updated successfully",
	})
}

func DeleteTask(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user").(int)

	_, err := db.DB.Exec(`DELETE FROM tasks WHERE id=$1 AND user_id=$2`, id, userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Could not delete task",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Task deleted successfully",
	})
}

func AssignTask(c *fiber.Ctx) error {
    taskID := c.Params("id")
    var assignment struct {
        AssignedTo int `json:"assigned_to"`
    }

    if err := c.BodyParser(&assignment); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "message": "Invalid JSON",
        })
    }

	var exists bool
    err := db.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)", assignment.AssignedTo).Scan(&exists)
    if err != nil || !exists {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "message": "Invalid assigned_to user",
        })
    }

    id, err := strconv.Atoi(taskID)
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "message": "Invalid task ID",
        })
    }

    userID := c.Locals("user").(int)
    result, err := db.DB.Exec(`
        UPDATE tasks 
        SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 AND user_id = $3`, 
        assignment.AssignedTo, id, userID)

    if err != nil {
        log.Printf("Error assigning task: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "message": "Could not assign task",
        })
    }

    rows, _ := result.RowsAffected()
    if rows == 0 {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
            "message": "Task not found or unauthorized",
        })
    }

	var updatedTask models.Task
    err = db.DB.Get(&updatedTask, "SELECT * FROM tasks WHERE id = $1", id)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "message": "Could not fetch updated task",
        })
    }

	// websocket broadcast
    update := fiber.Map{
        "type": "task_assigned",
        "task": updatedTask,
    }
    updateBytes, _ := json.Marshal(update)
    services.WS.BroadcastUpdate(updateBytes)

    return c.JSON(updatedTask)
}

func UpdateTaskStatus(c *fiber.Ctx) error {
	taskID := c.Params("id")
	var statusUpdate struct {
		Status models.Status `json:"status"`
	}

	if err := c.BodyParser(&statusUpdate); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid JSON",
		})
	}

	switch statusUpdate.Status {
	case models.InProgress, models.Completed, models.Pending:
	default:
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid status",
		})
	}

	id, err := strconv.Atoi(taskID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid task ID",
		})
	}

	userID := c.Locals("user").(int)
	result, err := db.DB.Exec(`UPDATE tasks 
        SET status = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 AND (user_id = $3 OR assigned_to = $3)`,
		statusUpdate.Status, id, userID)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Could not update task status",
		})
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "Task not found or unauthorized",
		})
	}

	// websocket broadcast
	update := fiber.Map{
        "type": "task_status_updated",
        "task_id": id,
        "status": statusUpdate.Status,
    }
    updateBytes, _ := json.Marshal(update)
    services.WS.BroadcastUpdate(updateBytes)

	return c.JSON(fiber.Map{
		"message": "Task status updated successfully",
		"status": statusUpdate.Status,
	})
}
