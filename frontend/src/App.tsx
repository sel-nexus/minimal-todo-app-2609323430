import { useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

/** Render and manage the current page's transient checklist. */
function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nextId, setNextId] = useState(1);
  const [inputValue, setInputValue] = useState('');

  /** Add a trimmed task and consume an ID only when the title is valid. */
  function addTask(): void {
    const title = inputValue.trim();
    if (title.length === 0) {
      return;
    }

    const task: Task = { id: nextId, title, completed: false };
    setTasks((currentTasks) => [...currentTasks, task]);
    setNextId((currentId) => currentId + 1);
    setInputValue('');
  }

  /** Submit the shared add operation from the form button or Enter key. */
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    addTask();
  }

  /** Keep Enter submission scoped to the focused task input. */
  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTask();
    }
  }

  /** Update only the selected task's completion state. */
  function toggleTask(taskId: number): void {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  /** Remove only the selected task without recycling its identifier. */
  function deleteTask(taskId: number): void {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  }

  /** Preserve the input value exactly as entered until a successful add. */
  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    setInputValue(event.currentTarget.value);
  }

  return (
    <main className="page-shell">
      <section className="todo-card" aria-labelledby="page-title">
        <header className="page-header">
          <p className="eyebrow">A LITTLE MORE DONE</p>
          <h1 id="page-title">Todo App</h1>
          <p className="intro-copy">Make room for what matters today.</p>
        </header>

        <form className="task-form" onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor="todo-input">
            New task
          </label>
          <input
            id="todo-input"
            data-testid="todo-input"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder="What needs doing?"
            autoComplete="off"
          />
          <button id="add-button" data-testid="add-button" type="submit">
            Add
          </button>
        </form>

        <div className="list-heading" aria-hidden="true">
          <span>YOUR LIST</span>
          <span className="task-count">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
        </div>

        <p
          id="empty-state"
          data-testid="empty-state"
          className="empty-state"
          hidden={tasks.length !== 0}
        >
          No tasks yet.
        </p>

        <ul id="todo-list" data-testid="todo-list" className="todo-list" aria-label="Tasks">
          {tasks.map((task) => (
            <li key={task.id} data-testid={`todo-item-${task.id}`} className="todo-item">
              <label className="task-label" htmlFor={`todo-checkbox-${task.id}`}>
                <input
                  id={`todo-checkbox-${task.id}`}
                  data-testid={`todo-checkbox-${task.id}`}
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />
                <span
                  data-testid={`todo-title-${task.id}`}
                  className={`task-title${task.completed ? ' is-completed' : ''}`}
                >
                  {task.title}
                </span>
              </label>
              <button
                data-testid={`todo-delete-${task.id}`}
                className="delete-button"
                type="button"
                aria-label={`Delete ${task.title}`}
                onClick={() => deleteTask(task.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
      <footer className="page-footer">One thing at a time.</footer>
    </main>
  );
}

export default App;
