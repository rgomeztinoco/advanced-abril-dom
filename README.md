**Tarea: Manipulación del DOM y Consumo de APIs**

**Objetivo:** Practicar el uso de JavaScript para manipular el DOM y realizar peticiones a una API basada en datos ingresados por el usuario.

**Instrucciones:**

1. **Formulario de búsqueda:**

    Crea un formulario que permita al usuario ingresar un término (por ejemplo, una palabra clave, un nombre, categoría, etc.).

2. **Fetch a una API pública:**

    Usa el valor del formulario para hacer una solicitud `fetch` a una API pública (puedes elegir la que prefieras, ejemplo: [PokéAPI](https://pokeapi.co/), [TheMealDB](https://www.themealdb.com/).). No tienen que ser esa necesariamente, si prefieren usar otra, bienvenidos

3. **Crear cards dinámicas:**

    Por cada resultado obtenido, crea una *card* que muestre información relevante (por ejemplo: nombre, imagen, descripción corta).

4. **Interacción con las cards:**

    Cada card debe tener dos funciones:

    - **Voltearse o Expandisre:** Al hacer clic o hover, debe mostrar más información (por ejemplo, usando CSS para girar la card y mostrar el reverso o agrandar la card y mostrar más información).
    - **Eliminarse:** Debe tener un botón para ser eliminada del DOM. (recuerda eliminarla también de tu objeto en el que manejas tu estado)

**Requisitos técnicos:**

- Usar `fetch()` a la API seleccionada con atributos dinámicos que vienen de algún form.
- Manipular el DOM para crear y eliminar elementos dinámicamente. (Usaremos closures)
- Estilizar la UI: la página debe de cumplir con estadares semánticos y de usabilidad

**Entrega:**

Sube tu trabajo a un repositorio en GitHub.