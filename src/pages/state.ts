//defino el tipo llamado Task, este describe como debe ser cada tarea del TO DO
export type Task ={
    id: number;
    task_content: string;
    completed: boolean;
}

export const state = { //acá guardo las tareas mientras la app está corriendo, sería como una bd en memoria
    tasks: [] as Task[],//inicializo un array vacío, el cual debe contener objetos del tipo Task que definí arriba
    nextId:1,//simplemente un contador de IDs, como está vacío, la primer tarea tendrá el id 1
    //NOTA AL HABER TERMINADO EL DESARROLLO: los ids quedan aunque se borren las tasks,es decir, si borras la task con el id 1, cuando crees otra task se va a crear con el id 2, no con el 1, supuestamente progra II está aceptado manejarlo asi.
    filter: "all" //me pareció buena la solución del amigo john paul morales, agregando al objeto en donde se encuentra actualmente
}