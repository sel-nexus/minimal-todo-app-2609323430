import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('Todo App task lifecycle', () => {
  it('renders the exact page identity and initial empty state', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Todo App' })).toBeInTheDocument();
    expect(screen.getByTestId('todo-input')).toHaveAttribute('type', 'text');
    expect(screen.getByTestId('add-button')).toHaveTextContent('Add');
    expect(screen.getByTestId('empty-state')).toHaveTextContent('No tasks yet.');
    expect(screen.getByTestId('empty-state')).toBeVisible();
    expect(screen.getByTestId('todo-list')).toBeEmptyDOMElement();
  });

  it('adds a trimmed task by button, clears the input, and assigns the first ID', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('textbox', { name: 'New task' });

    await user.type(input, '  Buy milk  ');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByTestId('todo-title-1')).toHaveTextContent('Buy milk');
    expect(screen.getByTestId('todo-checkbox-1')).not.toBeChecked();
    expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(screen.getByTestId('empty-state')).not.toBeVisible();
  });

  it('advances task IDs after each successful add', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('textbox', { name: 'New task' });

    await user.type(input, 'First successful task');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();

    await user.type(input, 'Second successful task');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByTestId('todo-item-2')).toBeInTheDocument();
    expect(screen.getByTestId('todo-list').children).toHaveLength(2);
  });

  it('adds exactly one task when Enter is pressed in the focused input', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('textbox', { name: 'New task' });

    await user.type(input, 'Read a chapter{Enter}');

    expect(screen.getByTestId('todo-list').children).toHaveLength(1);
    expect(screen.getByTestId('todo-title-1')).toHaveTextContent('Read a chapter');
    expect(input).toHaveValue('');
  });

  it('rejects whitespace-only button and Enter submissions without consuming an ID or clearing input', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('textbox', { name: 'New task' });

    await user.type(input, '   ');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(input).toHaveValue('   ');
    expect(screen.getByTestId('todo-list')).toBeEmptyDOMElement();

    await user.keyboard('{Enter}');
    expect(input).toHaveValue('   ');
    expect(screen.getByTestId('todo-list')).toBeEmptyDOMElement();

    await user.clear(input);
    await user.type(input, 'First valid task');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
  });

  it('rejects a blank submission without consuming an ID before the next successful add', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('textbox', { name: 'New task' });

    await user.type(input, '   ');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(input).toHaveValue('   ');
    expect(screen.getByTestId('todo-list')).toBeEmptyDOMElement();
    expect(screen.queryByTestId('todo-item-1')).not.toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'First valid task');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
    expect(screen.queryByTestId('todo-item-2')).not.toBeInTheDocument();
  });

  it('renders tasks in creation order with consistent sequential task selectors', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('textbox', { name: 'New task' });

    await user.type(input, 'First');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.type(input, 'Second');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.type(input, 'Third');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    const list = screen.getByTestId('todo-list');
    expect(within(list).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'FirstDelete',
      'SecondDelete',
      'ThirdDelete',
    ]);
    for (const id of [1, 2, 3]) {
      expect(screen.getByTestId(`todo-item-${id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`todo-checkbox-${id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`todo-title-${id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`todo-delete-${id}`)).toBeInTheDocument();
    }
  });

  it('toggles only the selected task and reverses its completion styling', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('textbox', { name: 'New task' });

    await user.type(input, 'Wash dishes');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.type(input, 'Water plants');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    const firstCheckbox = screen.getByTestId('todo-checkbox-1');
    const secondCheckbox = screen.getByTestId('todo-checkbox-2');
    await user.click(firstCheckbox);
    expect(firstCheckbox).toBeChecked();
    expect(screen.getByTestId('todo-title-1')).toHaveClass('is-completed');
    expect(secondCheckbox).not.toBeChecked();

    await user.click(firstCheckbox);
    expect(firstCheckbox).not.toBeChecked();
    expect(screen.getByTestId('todo-title-1')).not.toHaveClass('is-completed');
    expect(secondCheckbox).not.toBeChecked();
  });

  it('deletes only the selected task, preserves order, and does not recycle IDs', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('textbox', { name: 'New task' });

    for (const title of ['First', 'Middle', 'Last']) {
      await user.type(input, title);
      await user.click(screen.getByRole('button', { name: 'Add' }));
    }

    await user.click(screen.getByTestId('todo-delete-2'));
    expect(screen.getByTestId('todo-list').children).toHaveLength(2);
    expect(screen.getByTestId('todo-title-1')).toHaveTextContent('First');
    expect(screen.getByTestId('todo-title-3')).toHaveTextContent('Last');
    expect(screen.queryByTestId('todo-item-2')).not.toBeInTheDocument();

    await user.type(input, 'Next');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByTestId('todo-item-4')).toBeInTheDocument();
  });

  it('restores the exact empty state after deleting the final task', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('textbox', { name: 'New task' });

    await user.type(input, 'One task');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.click(screen.getByTestId('todo-delete-1'));

    expect(screen.getByTestId('todo-list')).toBeEmptyDOMElement();
    expect(screen.getByTestId('empty-state')).toHaveTextContent('No tasks yet.');
    expect(screen.getByTestId('empty-state')).toBeVisible();
  });

  it('renders markup-like titles literally without creating injected elements', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('textbox', { name: 'New task' });
    const unsafeTitle = '<img src=x onerror=alert(1)>';

    await user.type(input, unsafeTitle);
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByTestId('todo-title-1')).toHaveTextContent(unsafeTitle);
    expect(screen.getByTestId('todo-title-1').querySelector('img')).toBeNull();
  });

  it('starts with an empty list and ID sequence after a fresh render', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    const input = screen.getByRole('textbox', { name: 'New task' });

    await user.type(input, 'Temporary task');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    unmount();

    render(<App />);
    expect(screen.getByTestId('todo-list')).toBeEmptyDOMElement();
    expect(screen.getByTestId('empty-state')).toBeVisible();
    await user.type(screen.getByRole('textbox', { name: 'New task' }), 'Fresh task');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
  });
});
