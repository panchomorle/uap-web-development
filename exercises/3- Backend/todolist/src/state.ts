const example_tasks = [
    {
        id: 1,
        text: 'Personal Work No. 1',
        completed: false
    },
    {
        id: 2,
        text: 'Visitar la tumba de menem',
        completed: false
    },
    {
        id: 3,
        text: 'Liberar al patriarcado',
        completed: false
    },
    {
        id: 4,
        text: 'Menem lo hizo?',
        completed: false
    },
]

export const state = {
    tasks: [...example_tasks],
    filter: "all"
  };