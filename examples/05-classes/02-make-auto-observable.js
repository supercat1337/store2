// @ts-check

/**
 * =============================================
 * 2. makeAutoObservable (Automatic Annotations)
 * =============================================
 * makeAutoObservable infers reactivity from the class structure:
 * - All enumerable properties become 'atom'
 * - All getters become 'computed'
 * - Arrays become 'collection'
 * - Objects become 'shallowReactive'
 *
 * You can override with a second parameter (overrides).
 *
 */

import { makeAutoObservable, autorun } from '@supercat1337/store2';

class TodoList {
    todos = []; // becomes collection (array)
    filter = 'all'; // becomes atom
    newTodoText = ''; // becomes atom

    // Computed getters
    get filteredTodos() {
        if (this.filter === 'all') return this.todos;
        if (this.filter === 'active') {
            return this.todos.filter(todo => !todo.completed);
        }
        return this.todos.filter(todo => todo.completed);
    }

    get pendingCount() {
        return this.todos.filter(todo => !todo.completed).length;
    }

    constructor() {
        makeAutoObservable(this);
        // Add some initial data
        this.todos = [
            { id: 1, text: 'Learn store2', completed: false },
            { id: 2, text: 'Build a project', completed: false },
        ];
    }

    addTodo(text) {
        if (!text) return;
        this.todos.push({ id: Date.now(), text, completed: false });
        this.newTodoText = '';
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) todo.completed = !todo.completed;
    }

    removeTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
    }

    setFilter(filter) {
        this.filter = filter;
    }
}

const store = new TodoList();

// Subscribe to filtered todos and pending count
autorun(() => {
    console.log('Filtered todos:', store.filteredTodos.map(t => t.text).join(', '));
});

autorun(() => {
    console.log(`Pending: ${store.pendingCount}`);
});

// Initial output: Filtered todos: Learn store2, Build a project ; Pending: 2

store.addTodo('Write tests');
// Filtered todos: Learn store2, Build a project, Write tests ; Pending: 3

store.toggleTodo(1);
// Pending: 2 ; Filtered todos: Learn store2 (if filter=completed, etc.)

store.setFilter('active');
// Filtered todos: Build a project, Write tests

// You can also override inference
class User {
    name = '';
    #privateData = {}; // using private field – not enumerable

    get displayName() {
        return `User: ${this.name}`;
    }

    constructor(name) {
        this.name = name;
        // Override: make name reactive, but exclude #privateData (already not enumerable)
        makeAutoObservable(this, { displayName: 'computed' });
    }
}
