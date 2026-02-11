# 🎵 Firefox Custom Sounds

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Firefox](https://img.shields.io/badge/Firefox-Add--on-orange.svg)](https://addons.mozilla.org/firefox/)

### Idiomas disponibles
[![Language: English](https://img.shields.io/badge/Language-English-blue.svg)](README.md) [![Idioma: Español](https://img.shields.io/badge/Idioma-Español-red.svg)](README.es.md)

**Firefox Custom Sounds** es una extensión diseñada para personalizar la experiencia al navegar por internet añadiendo efectos de sonido a diferentes acciones dentro del navegador Firefox.

---

## 🖼️ Imagenes
### Página de Configuraciones
![Página de opciones](/images/options_page.png "Página de configuraciones")

### Modal para personalizar los Eventos
![Modal](/images/modal.png "Modal de eventos")

---

## ✨ Características
- 🔊 **Sonidos Personalizables:** actualmente, puedes asignar sonidos a:
   * ➕ Abrir/Cerrar pestañas.
   * ⌨️ Pulsaciones de teclas.

- 🛠️ **Configuración Sencilla:** interfaz intuitiva para gestionar tus archivos de audio.

- 🚀 **Ligero:** optimizado para no afectar el rendimiento del navegador.

## ⏭️ ~~Próximas Características~~ Características Finalizadas
- 🎚️ **Controlador de Volumen:** para que seas tú quien decida qué tan rápido destrozar tus oídos.

- ⌨️ **Múltiples teclas, mismo sonido:** para que asignes tus sonidos favoritos a tu teclado.

## 💻 Tecnologías utilizadas
* JavaScript (WebExtensionAPI): para la lógica de fondo y eventos del navegador.

* HTML: para la página de opciones.

* CSS (Tailwind CSS): para el diseño de la interfaz.

* Firefox Browser API: para el manejo de pestañas y eventos.

## ⬇️ Instalación

### Para Usuarios
[**Ya disponible en AMO**](https://addons.mozilla.org/es-ES/firefox/addon/custom-sounds/) o, si prefieres, puedes instalarlo manualmente descargando el Release o siguiendo los pasos de desarrollo.

### Guía para Desarrolladores (Instalación Manual)
Si deseas modificar la extensión o contribuir al código, sigue estos pasos para configurar tu entorno local.

1. **Clona este repositorio**
   ```bash
   git clone https://github.com/Kirutre/firefox_custom_sounds.git

   cd firefox_custom_sounds
   ```

2. **Gestión de Estilos (Tailwind CSS)**

   Esta extensión utiliza Tailwind CSS para la interfaz. El archivo `output.css` ya viene incluido en el repositorio para que la extensión funcione inmediatamente, pero si realizas cambios en el diseño, deberás recompilarlo.

   #### Recompilar `output.css`
   1. Descarga el ejecutable de la CLI según tu sistema operativo desde [Tailwind CSS Releases](https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.1.18).

   2. Coloca el ejecutable en la raíz del proyecto y renombralo a `tailwindcss-cli`.

   3. Ejecuta el siguiente comando para compilar y observar cambios en tiempo real.

   ```bash
   ./tailwindcss-cli -i ./options/input.css -o ./options/output.css --watch --minify
   ```

> [!TIP]
> Si tienes `Node.js` instalado, puedes evitar descargar el binario manualmente usando:

```bash
npx @tailwindcss/cli -i ./options/input.css -o ./options/output.css --watch --minify
```

3. **Cargar en Firefox para pruebas**
   1. Abre Firefox y escribe `about:debugging` en la barra de direcciones.

   2. Haz clic en "Este Firefox".

   3. Haz click en "Cargar complemento temporal...".

   4. Selecciona el archivo `manifest.json` que se encuentra en la raíz del proyecto.

## 🤝 Contribuir
¡Las contribuciones son lo que hacen mejorar al software, y estoy encantado de ver que puedes ofrecer!

1. Haz un **Fork** del proyecto.

2. Crea una **Rama** para tu desarrollo (`git checkout -b feature/destroy-this-extension`).

3. Haz un **Commit** de tus cambios (`git commit -m 'change 1px bug in setKeyButton radius'`).

4. Haz un **Push** a la rama (`git push origin feature/destroy-this-extension`).

5. Abre un **Pull Request**.

> [!NOTE] 
> Omitiendo la comedia, sé lo más descriptivo posible con los nombres que uses.

## 📝 Licencia
Distribuido bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más información.

## 📬 Contacto
Kirutre - [GitHub](https://github.com/kirutre)

Kirutre - contact.kirutre+firefox@gmail.com

Link del proyecto: https://github.com/Kirutre/firefox_custom_sounds