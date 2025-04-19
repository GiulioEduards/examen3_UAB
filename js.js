let db;
      let ciudadSeleccionada = null;
      let tipoSeleccionado = null;

      window.onload = () => {
        const request = indexedDB.open("MiDB", 1);

        request.onupgradeneeded = (event) => {
          db = event.target.result;

          const ciudades = db.createObjectStore("ciudades", {
            keyPath: "id",
            autoIncrement: true,
          });
          ciudades.createIndex("nombre", "nombre", { unique: true });

          const tipos = db.createObjectStore("tipos", {
            keyPath: "id",
            autoIncrement: true,
          });
          tipos.createIndex("nombre", "nombre", { unique: true });

          const establecimientos = db.createObjectStore("establecimientos", {
            keyPath: "id",
            autoIncrement: true,
          });
          establecimientos.createIndex("ciudad", "ciudad", {});
          establecimientos.createIndex("tipo", "tipo", {});
        };

        request.onsuccess = (event) => {
          db = event.target.result;
          mostrarCiudades();
          mostrarTipos();
          mostrarEstablecimientos();
        };
      };

      function mostrarFormularioCiudad() {
        document.getElementById('ciudad-nombre').value = '';
        const modal = new bootstrap.Modal(document.getElementById('modalAgregarCiudad'));
        modal.show();
      }

      function agregarCiudad() {
        const nombre = document.getElementById("ciudad-nombre").value;
        if (!nombre) {
          alert("Por favor ingresa un nombre para la ciudad");
          return;
        }
      
        const tx = db.transaction("ciudades", "readwrite");
        const store = tx.objectStore("ciudades");
        store.add({ nombre });
        
        tx.oncomplete = () => {
          document.getElementById("ciudad-nombre").value = "";
          const modal = bootstrap.Modal.getInstance(document.getElementById('modalAgregarCiudad'));
          modal.hide();
          mostrarCiudades();
        };
        
        tx.onerror = (event) => {
          console.error("Error al agregar ciudad:", event.target.error);
          alert("Ocurrió un error al agregar la ciudad. Verifica que no exista una ciudad con el mismo nombre.");
        };
      }

      function mostrarCiudades() {
        const tx = db.transaction("ciudades", "readonly");
        const store = tx.objectStore("ciudades");
        const container = document.getElementById("ciudades-container");
        const select = document.getElementById("establecimiento-ciudad");
        if (select) select.innerHTML = "";
        container.innerHTML = "";

        store.openCursor().onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const btn = document.createElement("div");
            btn.className = "hover-edit";
            btn.innerHTML = `<button class="btn btn-outline-dark" onclick="filtrarPorCiudad(${cursor.value.id})">${cursor.value.nombre}</button>
            <div class="edit-buttons">
            
              <button class="btn btn-sm btn-outline-warning" onclick="editarCiudad(${cursor.value.id})">Editar</button>
              <button class="btn btn-sm btn-outline-danger" onclick="eliminarCiudad(${cursor.value.id})">Eliminar</button>
            </div>`;
            container.appendChild(btn);

            if (select) {
              const option = document.createElement("option");
              option.value = cursor.value.id;
              option.textContent = cursor.value.nombre;
              select.appendChild(option);
            }

            cursor.continue();
          }
        };
      }

      function mostrarFormularioTipo() {
        document.getElementById('tipo-nombre').value = '';
        const modal = new bootstrap.Modal(document.getElementById('modalAgregarTipo'));
        modal.show();
      }

      function agregarTipo() {
        const nombre = document.getElementById("tipo-nombre").value;
        if (!nombre) {
          alert("Por favor ingresa un nombre para el tipo");
          return;
        }
      
        const tx = db.transaction("tipos", "readwrite");
        const store = tx.objectStore("tipos");
        store.add({ nombre });
        
        tx.oncomplete = () => {
          document.getElementById("tipo-nombre").value = "";
          const modal = bootstrap.Modal.getInstance(document.getElementById('modalAgregarTipo'));
          modal.hide();
          mostrarTipos();
        };
        
        tx.onerror = (event) => {
          console.error("Error al agregar tipo:", event.target.error);
          alert("Ocurrió un error al agregar el tipo. Verifica que no exista un tipo con el mismo nombre.");
        };
      }

      function mostrarTipos() {
        const tx = db.transaction("tipos", "readonly");
        const store = tx.objectStore("tipos");
        const container = document.getElementById("tipos-container");
        const select = document.getElementById("establecimiento-tipo");
        if (select) select.innerHTML = "";
        container.innerHTML = "";

        store.openCursor().onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const btn = document.createElement("div");
            btn.className = "hover-edit";
            btn.innerHTML = `<button class="btn btn-outline-dark" onclick="filtrarPorTipo(${cursor.value.id})">${cursor.value.nombre}</button>
            <div class="edit-buttons">
              <button class="btn btn-sm btn-outline-warning" onclick="editarTipo(${cursor.value.id})">Editar</button>
              <button class="btn btn-sm btn-outline-danger" onclick="eliminarTipo(${cursor.value.id})">Eliminar</button>
            </div>`;
            container.appendChild(btn);

            if (select) {
              const option = document.createElement("option");
              option.value = cursor.value.id;
              option.textContent = cursor.value.nombre;
              select.appendChild(option);
            }

            cursor.continue();
          }
        };
      }

      function mostrarFormularioEstablecimiento() {
        // Limpiar formulario
        document.getElementById('establecimiento-nombre').value = '';
        document.getElementById('establecimiento-descripcion').value = '';
        document.getElementById('establecimiento-imagen').value = '';
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('modalAgregarEstablecimiento'));
        modal.show();
      }

      function agregarEstablecimiento() {
        const nombre = document.getElementById("establecimiento-nombre").value;
        const ciudad = parseInt(document.getElementById("establecimiento-ciudad").value);
        const tipo = parseInt(document.getElementById("establecimiento-tipo").value);
        const descripcion = document.getElementById("establecimiento-descripcion").value;
        const imagen = document.getElementById("establecimiento-imagen").value;
      
        if (!nombre || isNaN(ciudad) || isNaN(tipo)) {
          alert("Por favor completa los campos requeridos (Nombre, Ciudad y Tipo)");
          return;
        }
      
        const tx = db.transaction("establecimientos", "readwrite");
        const store = tx.objectStore("establecimientos");
        store.add({ nombre, ciudad, tipo, descripcion, imagen });
        
        tx.oncomplete = () => {
          // Limpiar campos y cerrar modal
          document.getElementById("establecimiento-nombre").value = "";
          document.getElementById("establecimiento-descripcion").value = "";
          document.getElementById("establecimiento-imagen").value = "";
          
          const modal = bootstrap.Modal.getInstance(document.getElementById('modalAgregarEstablecimiento'));
          modal.hide();
          mostrarEstablecimientos();
        };
        
        tx.onerror = (event) => {
          console.error("Error al agregar establecimiento:", event.target.error);
          alert("Ocurrió un error al agregar el establecimiento.");
        };
      }

      function mostrarEstablecimientos() {
        const container = document.getElementById("establecimientos-container");
        container.innerHTML = "";
        const tx = db.transaction("establecimientos", "readonly");
        const store = tx.objectStore("establecimientos");
        const request = store.openCursor();

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const est = cursor.value;
            if (
              (!ciudadSeleccionada || est.ciudad === ciudadSeleccionada) &&
              (!tipoSeleccionado || est.tipo === tipoSeleccionado)
            ) {
              const col = document.createElement("div");
              col.className = "col-md-4 mb-3";
              col.innerHTML = `
          <div class="card h-100">
            <img src="${est.imagen}" class="card-img-top" alt="${est.nombre}" style="height: 200px; object-fit: cover;">
            <div class="card-body">
              <h5 class="card-title">${est.nombre}</h5>
              <p class="card-text">${est.descripcion}</p>
            </div>
            <div class="card-footer">
              <button class="btn btn-sm btn-warning" onclick="editarEstablecimiento(${est.id})">Editar</button>
              <button class="btn btn-sm btn-danger" onclick="eliminarEstablecimiento(${est.id})">Eliminar</button>
            </div>
          </div>
        `;
              container.appendChild(col);
            }
            cursor.continue();
          }
        };
      }

      function filtrarPorCiudad(id) {
        ciudadSeleccionada = id;
        mostrarEstablecimientos();
      }

      function filtrarPorTipo(id) {
        tipoSeleccionado = id;
        mostrarEstablecimientos();
      }

      // Agrega estas funciones después de tus otras funciones en el script

      function editarCiudad(id) {
        const tx = db.transaction("ciudades", "readwrite");
        const store = tx.objectStore("ciudades");
        const request = store.get(id);
      
        request.onsuccess = (event) => {
          const ciudad = event.target.result;
          // Llenar el modal con los datos actuales
          document.getElementById('editar-ciudad-id').value = ciudad.id;
          document.getElementById('editar-ciudad-nombre').value = ciudad.nombre;
          
          // Mostrar el modal
          const modal = new bootstrap.Modal(document.getElementById('modalEditarCiudad'));
          modal.show();
        };
      }
      
      function guardarEdicionCiudad() {
        const id = parseInt(document.getElementById('editar-ciudad-id').value);
        const nombre = document.getElementById('editar-ciudad-nombre').value;
      
        if (!nombre) {
          alert("Por favor ingresa un nombre para la ciudad");
          return;
        }
      
        const tx = db.transaction("ciudades", "readwrite");
        const store = tx.objectStore("ciudades");
        
        store.get(id).onsuccess = (event) => {
          const ciudad = event.target.result;
          ciudad.nombre = nombre;
          
          store.put(ciudad);
          
          tx.oncomplete = () => {
            // Cerrar el modal y actualizar la vista
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarCiudad'));
            modal.hide();
            mostrarCiudades();
          };
        };
      }

      function eliminarCiudad(id) {
        if (confirm("¿Estás seguro de que quieres eliminar esta ciudad?")) {
          const tx = db.transaction(
            ["ciudades", "establecimientos"],
            "readwrite"
          );
          const ciudadesStore = tx.objectStore("ciudades");
          const establecimientosStore = tx.objectStore("establecimientos");

          // Eliminar la ciudad
          ciudadesStore.delete(id);

          // Eliminar establecimientos asociados a esta ciudad
          const index = establecimientosStore.index("ciudad");
          const request = index.openCursor(IDBKeyRange.only(id));

          request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
              cursor.delete();
              cursor.continue();
            }
          };

          tx.oncomplete = () => {
            mostrarCiudades();
            mostrarEstablecimientos();
          };
        }
      }

      function editarTipo(id) {
        const tx = db.transaction("tipos", "readwrite");
        const store = tx.objectStore("tipos");
        const request = store.get(id);
      
        request.onsuccess = (event) => {
          const tipo = event.target.result;
          // Llenar el modal con los datos actuales
          document.getElementById('editar-tipo-id').value = tipo.id;
          document.getElementById('editar-tipo-nombre').value = tipo.nombre;
          
          // Mostrar el modal
          const modal = new bootstrap.Modal(document.getElementById('modalEditarTipo'));
          modal.show();
        };
      }
      
      function guardarEdicionTipo() {
        const id = parseInt(document.getElementById('editar-tipo-id').value);
        const nombre = document.getElementById('editar-tipo-nombre').value;
      
        if (!nombre) {
          alert("Por favor ingresa un nombre para el tipo");
          return;
        }
      
        const tx = db.transaction("tipos", "readwrite");
        const store = tx.objectStore("tipos");
        
        store.get(id).onsuccess = (event) => {
          const tipo = event.target.result;
          tipo.nombre = nombre;
          
          store.put(tipo);
          
          tx.oncomplete = () => {
            // Cerrar el modal y actualizar la vista
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarTipo'));
            modal.hide();
            mostrarTipos();
          };
        };
      }

      function eliminarTipo(id) {
        if (confirm("¿Estás seguro de que quieres eliminar este tipo?")) {
          const tx = db.transaction(["tipos", "establecimientos"], "readwrite");
          const tiposStore = tx.objectStore("tipos");
          const establecimientosStore = tx.objectStore("establecimientos");

          // Eliminar el tipo
          tiposStore.delete(id);

          // Eliminar establecimientos asociados a este tipo
          const index = establecimientosStore.index("tipo");
          const request = index.openCursor(IDBKeyRange.only(id));

          request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
              cursor.delete();
              cursor.continue();
            }
          };

          tx.oncomplete = () => {
            mostrarTipos();
            mostrarEstablecimientos();
          };
        }
      }
      function editarEstablecimiento(id) {
        const tx = db.transaction(["establecimientos", "ciudades", "tipos"], "readonly");
        const establecimientosStore = tx.objectStore("establecimientos");
        const ciudadesStore = tx.objectStore("ciudades");
        const tiposStore = tx.objectStore("tipos");
        
        // Obtener el establecimiento
        establecimientosStore.get(id).onsuccess = (event) => {
          const establecimiento = event.target.result;
          
          // Llenar el formulario del modal
          document.getElementById('editar-id').value = establecimiento.id;
          document.getElementById('editar-nombre').value = establecimiento.nombre;
          document.getElementById('editar-descripcion').value = establecimiento.descripcion;
          document.getElementById('editar-imagen').value = establecimiento.imagen;
          
          // Llenar el select de ciudades
          const selectCiudad = document.getElementById('editar-ciudad');
          selectCiudad.innerHTML = '';
          ciudadesStore.openCursor().onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              const option = document.createElement('option');
              option.value = cursor.value.id;
              option.textContent = cursor.value.nombre;
              option.selected = (cursor.value.id === establecimiento.ciudad);
              selectCiudad.appendChild(option);
              cursor.continue();
            }
          };
          
          // Llenar el select de tipos
          const selectTipo = document.getElementById('editar-tipo');
          selectTipo.innerHTML = '';
          tiposStore.openCursor().onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              const option = document.createElement('option');
              option.value = cursor.value.id;
              option.textContent = cursor.value.nombre;
              option.selected = (cursor.value.id === establecimiento.tipo);
              selectTipo.appendChild(option);
              cursor.continue();
            }
          };
          
          // Mostrar el modal
          const modal = new bootstrap.Modal(document.getElementById('modalEditarEstablecimiento'));
          modal.show();
        };
      }
      
      function guardarEdicionEstablecimiento() {
        const id = parseInt(document.getElementById('editar-id').value);
        const nombre = document.getElementById('editar-nombre').value;
        const ciudad = parseInt(document.getElementById('editar-ciudad').value);
        const tipo = parseInt(document.getElementById('editar-tipo').value);
        const descripcion = document.getElementById('editar-descripcion').value;
        const imagen = document.getElementById('editar-imagen').value;
        
        const tx = db.transaction("establecimientos", "readwrite");
        const store = tx.objectStore("establecimientos");
        
        store.get(id).onsuccess = (event) => {
          const establecimiento = event.target.result;
          establecimiento.nombre = nombre;
          establecimiento.ciudad = ciudad;
          establecimiento.tipo = tipo;
          establecimiento.descripcion = descripcion;
          establecimiento.imagen = imagen;
          
          store.put(establecimiento);
          
          tx.oncomplete = () => {
            // Cerrar el modal y actualizar la vista
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarEstablecimiento'));
            modal.hide();
            mostrarEstablecimientos();
          };
        };
      }

      function eliminarEstablecimiento(id) {
        if (
          confirm("¿Estás seguro de que quieres eliminar este establecimiento?")
        ) {
          const tx = db.transaction("establecimientos", "readwrite");
          const store = tx.objectStore("establecimientos");
          store.delete(id);
          tx.oncomplete = () => {
            mostrarEstablecimientos();
          };
        }
      }
    