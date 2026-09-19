CREATE DATABASE IF NOT EXISTS golds_gym
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE golds_gym;

-- ---------------------------------------------------------------------
--  SEGURIDAD: roles / permisos / usuarios
-- ---------------------------------------------------------------------
CREATE TABLE roles (
  idroles INT NOT NULL AUTO_INCREMENT,
  nombre  VARCHAR(45) NOT NULL,
  PRIMARY KEY (idroles),
  UNIQUE KEY uq_roles_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE permisos (
  idpermisos  INT NOT NULL AUTO_INCREMENT,
  descripcion VARCHAR(255) NOT NULL,
  PRIMARY KEY (idpermisos)
) ENGINE=InnoDB;

CREATE TABLE roles_permisos (
  idroles    INT NOT NULL,
  idpermisos INT NOT NULL,
  PRIMARY KEY (idroles, idpermisos),
  CONSTRAINT fk_rp_roles    FOREIGN KEY (idroles)    REFERENCES roles (idroles)       ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rp_permisos FOREIGN KEY (idpermisos) REFERENCES permisos (idpermisos) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Usuarios (
  idUsuarios     INT NOT NULL AUTO_INCREMENT,
  email          VARCHAR(150) NOT NULL,
  password       VARCHAR(250) NOT NULL,
  estado         TINYINT NOT NULL DEFAULT 1,
  creado_en      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en VARCHAR(45) NULL,
  idroles        INT NOT NULL,
  PRIMARY KEY (idUsuarios),
  UNIQUE KEY uq_usuarios_email (email),
  KEY idx_usuarios_roles (idroles),
  CONSTRAINT fk_usuarios_roles FOREIGN KEY (idroles) REFERENCES roles (idroles) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Perfil_Usuario (
  idPerfil_Usuario INT NOT NULL AUTO_INCREMENT,
  Identificacion   VARCHAR(20) NOT NULL,
  nombres          VARCHAR(100) NOT NULL,
  apellidos        VARCHAR(100) NOT NULL,
  telefono         VARCHAR(20) NULL,
  foto             VARCHAR(255) NULL,
  peso_kg          DECIMAL(5,2) NULL,
  altura_cm        DECIMAL(5,2) NULL,
  dias_disponibles INT NULL,
  idUsuarios       INT NOT NULL,
  PRIMARY KEY (idPerfil_Usuario),
  UNIQUE KEY uq_perfil_identificacion (Identificacion),
  UNIQUE KEY uq_perfil_usuario (idUsuarios),
  CONSTRAINT fk_perfil_usuarios FOREIGN KEY (idUsuarios) REFERENCES Usuarios (idUsuarios) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  PLANES / PROMOCIONES / SUSCRIPCIONES
-- ---------------------------------------------------------------------
CREATE TABLE plan (
  idplanas      INT NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(100) NOT NULL,
  descripcion   VARCHAR(255) NULL,
  precio        DECIMAL(10,2) NOT NULL,
  duracion_dias INT NOT NULL,
  estado        TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (idplanas)
) ENGINE=InnoDB;

CREATE TABLE promocion_IA (
  idpromocion_IA       INT NOT NULL AUTO_INCREMENT,
  titulo               VARCHAR(100) NOT NULL,
  texto_publicictario  VARCHAR(255) NULL,
  imagen_promt         VARCHAR(255) NULL,
  imagen_url           VARCHAR(500) NULL,
  descuento_porcentaje DECIMAL(5,2) NULL,
  fecha_inicio         DATETIME NULL,
  fecha_fin            DATETIME NULL,
  estado               TINYINT NOT NULL DEFAULT 1,
  creado_en            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  idplanas             INT NOT NULL,
  PRIMARY KEY (idpromocion_IA),
  KEY idx_promo_plan (idplanas),
  CONSTRAINT fk_promo_plan FOREIGN KEY (idplanas) REFERENCES plan (idplanas) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE suscripciones (
  idsuscripciones INT NOT NULL AUTO_INCREMENT,
  fecha_inicio    DATE NOT NULL,
  fecha_fin       DATE NOT NULL,
  estado          TINYINT NOT NULL DEFAULT 1,
  creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  idplanas        INT NOT NULL,
  idUsuarios      INT NOT NULL,
  PRIMARY KEY (idsuscripciones),
  KEY idx_susc_plan (idplanas),
  KEY idx_susc_usuario (idUsuarios),
  CONSTRAINT fk_susc_plan    FOREIGN KEY (idplanas)   REFERENCES plan (idplanas)        ON UPDATE CASCADE,
  CONSTRAINT fk_susc_usuario FOREIGN KEY (idUsuarios) REFERENCES Usuarios (idUsuarios) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE asistencias (
  idasistencias INT NOT NULL AUTO_INCREMENT,
  fecha_entrada DATETIME NOT NULL,
  fecha_salida  DATETIME NULL,
  idplanas      INT NOT NULL,
  PRIMARY KEY (idasistencias),
  KEY idx_asist_plan (idplanas),
  CONSTRAINT fk_asist_plan FOREIGN KEY (idplanas) REFERENCES plan (idplanas) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE permisos_ausencion (
  idpermisos_ausencion INT NOT NULL AUTO_INCREMENT,
  motivo               VARCHAR(255) NOT NULL,
  dias_agregados       INT NOT NULL DEFAULT 0,
  solicitado_en        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  idsuscripciones      INT NOT NULL,
  PRIMARY KEY (idpermisos_ausencion),
  KEY idx_pausencia_susc (idsuscripciones),
  CONSTRAINT fk_pausencia_susc FOREIGN KEY (idsuscripciones) REFERENCES suscripciones (idsuscripciones) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  PAGOS
-- ---------------------------------------------------------------------
CREATE TABLE metodos_pago (
  idmetodos_pago INT NOT NULL AUTO_INCREMENT,
  nombre         VARCHAR(45) NOT NULL,
  PRIMARY KEY (idmetodos_pago)
) ENGINE=InnoDB;

CREATE TABLE pagos (
  idpagos         INT NOT NULL AUTO_INCREMENT,
  estado          TINYINT NOT NULL DEFAULT 0,
  monto           DECIMAL(10,2) NOT NULL,
  fecha_pago      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  idsuscripciones INT NOT NULL,
  idmetodos_pago  INT NOT NULL,
  PRIMARY KEY (idpagos),
  KEY idx_pagos_susc (idsuscripciones),
  KEY idx_pagos_metodo (idmetodos_pago),
  CONSTRAINT fk_pagos_susc   FOREIGN KEY (idsuscripciones) REFERENCES suscripciones (idsuscripciones) ON UPDATE CASCADE,
  CONSTRAINT fk_pagos_metodo FOREIGN KEY (idmetodos_pago)  REFERENCES metodos_pago (idmetodos_pago)   ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  RUTINAS IA
-- ---------------------------------------------------------------------
CREATE TABLE rutinas_IA (
  idrutinas_IA     INT NOT NULL AUTO_INCREMENT,
  titulo           VARCHAR(100) NOT NULL,
  contexto         VARCHAR(255) NULL,
  respuesta        TEXT NULL,
  duracuion_semana INT NULL,
  estado           TINYINT NOT NULL DEFAULT 1,
  creado_en        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  idUsuarios       INT NOT NULL,
  PRIMARY KEY (idrutinas_IA),
  KEY idx_rutinas_usuario (idUsuarios),
  CONSTRAINT fk_rutinas_usuario FOREIGN KEY (idUsuarios) REFERENCES Usuarios (idUsuarios) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ejerccios_rutina (
  idejerccios_rutina INT NOT NULL AUTO_INCREMENT,
  dia_num            INT NOT NULL,
  grupo_muscular     VARCHAR(45) NULL,
  nombre_ejercicio   VARCHAR(100) NOT NULL,
  series             INT NULL,
  repeticiones       VARCHAR(20) NULL,
  descanso_sec       INT NULL,
  notas_tecnicas     VARCHAR(45) NULL,
  idrutinas_IA       INT NOT NULL,
  PRIMARY KEY (idejerccios_rutina),
  KEY idx_ejer_rutina (idrutinas_IA),
  CONSTRAINT fk_ejer_rutina FOREIGN KEY (idrutinas_IA) REFERENCES rutinas_IA (idrutinas_IA) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
--  EXTENSIÓN: BAR LÁCTEO (CARRITO DE COMPRAS)
-- =====================================================================

-- Categorías del bar (batidos, yogures, snacks, etc.)
CREATE TABLE categorias_bar (
  idcategorias_bar INT NOT NULL AUTO_INCREMENT,
  nombre           VARCHAR(60) NOT NULL,
  descripcion      VARCHAR(255) NULL,
  estado           TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (idcategorias_bar),
  UNIQUE KEY uq_catbar_nombre (nombre)
) ENGINE=InnoDB;

-- Productos que vende el bar lácteo
CREATE TABLE productos_bar (
  idproductos_bar  INT NOT NULL AUTO_INCREMENT,
  nombre           VARCHAR(100) NOT NULL,
  descripcion      VARCHAR(255) NULL,
  precio           DECIMAL(10,2) NOT NULL,
  stock            INT NOT NULL DEFAULT 0,
  imagen_url       VARCHAR(500) NULL,
  estado           TINYINT NOT NULL DEFAULT 1,           -- 1 = disponible, 0 = inactivo
  creado_en        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  idcategorias_bar INT NOT NULL,
  PRIMARY KEY (idproductos_bar),
  KEY idx_prodbar_categoria (idcategorias_bar),
  CONSTRAINT chk_prodbar_precio CHECK (precio >= 0),
  CONSTRAINT chk_prodbar_stock  CHECK (stock >= 0),
  CONSTRAINT fk_prodbar_categoria FOREIGN KEY (idcategorias_bar) REFERENCES categorias_bar (idcategorias_bar) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Carrito (uno activo por usuario a la vez, se controla desde la app)
CREATE TABLE carrito (
  idcarrito      INT NOT NULL AUTO_INCREMENT,
  estado         TINYINT NOT NULL DEFAULT 1,             -- 1 = activo, 2 = convertido en pedido, 3 = abandonado
  creado_en      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  idUsuarios     INT NOT NULL,
  PRIMARY KEY (idcarrito),
  KEY idx_carrito_usuario_estado (idUsuarios, estado),
  CONSTRAINT fk_carrito_usuario FOREIGN KEY (idUsuarios) REFERENCES Usuarios (idUsuarios) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Ítems del carrito
CREATE TABLE carrito_items (
  idcarrito_items INT NOT NULL AUTO_INCREMENT,
  cantidad        INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,                -- precio al momento de agregarlo
  notas           VARCHAR(150) NULL,                     -- ej. "sin azúcar", "extra hielo"
  agregado_en     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  idcarrito       INT NOT NULL,
  idproductos_bar INT NOT NULL,
  PRIMARY KEY (idcarrito_items),
  UNIQUE KEY uq_carrito_producto (idcarrito, idproductos_bar),
  KEY idx_citems_producto (idproductos_bar),
  CONSTRAINT chk_citems_cantidad CHECK (cantidad > 0),
  CONSTRAINT fk_citems_carrito  FOREIGN KEY (idcarrito)       REFERENCES carrito (idcarrito)             ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_citems_producto FOREIGN KEY (idproductos_bar) REFERENCES productos_bar (idproductos_bar) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Pedido generado al confirmar el carrito
CREATE TABLE pedidos_bar (
  idpedidos_bar  INT NOT NULL AUTO_INCREMENT,
  total          DECIMAL(10,2) NOT NULL,
  estado         TINYINT NOT NULL DEFAULT 1,             -- 1 = pendiente, 2 = preparando, 3 = entregado, 4 = cancelado
  estado_pago    TINYINT NOT NULL DEFAULT 0,             -- 0 = pendiente, 1 = pagado
  fecha_pedido   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_entrega  DATETIME NULL,
  idcarrito      INT NULL,
  idUsuarios     INT NOT NULL,
  idmetodos_pago INT NOT NULL,
  PRIMARY KEY (idpedidos_bar),
  UNIQUE KEY uq_pedidosbar_carrito (idcarrito),
  KEY idx_pedidosbar_usuario (idUsuarios),
  KEY idx_pedidosbar_metodo (idmetodos_pago),
  CONSTRAINT fk_pedidosbar_carrito FOREIGN KEY (idcarrito)      REFERENCES carrito (idcarrito)           ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_pedidosbar_usuario FOREIGN KEY (idUsuarios)     REFERENCES Usuarios (idUsuarios)         ON UPDATE CASCADE,
  CONSTRAINT fk_pedidosbar_metodo  FOREIGN KEY (idmetodos_pago) REFERENCES metodos_pago (idmetodos_pago) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Detalle del pedido (congela nombre y precio del producto)
CREATE TABLE pedidos_bar_detalle (
  idpedidos_bar_detalle INT NOT NULL AUTO_INCREMENT,
  cantidad              INT NOT NULL,
  precio_unitario       DECIMAL(10,2) NOT NULL,
  subtotal              DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  notas                 VARCHAR(150) NULL,
  idpedidos_bar         INT NOT NULL,
  idproductos_bar       INT NOT NULL,
  PRIMARY KEY (idpedidos_bar_detalle),
  KEY idx_pbd_pedido (idpedidos_bar),
  KEY idx_pbd_producto (idproductos_bar),
  CONSTRAINT chk_pbd_cantidad CHECK (cantidad > 0),
  CONSTRAINT fk_pbd_pedido   FOREIGN KEY (idpedidos_bar)   REFERENCES pedidos_bar (idpedidos_bar)       ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pbd_producto FOREIGN KEY (idproductos_bar) REFERENCES productos_bar (idproductos_bar)   ON UPDATE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
--  VISTA: resumen del carrito (líneas + total por carrito)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vista_carrito_detalle AS
SELECT
  c.idcarrito,
  c.idUsuarios,
  c.estado AS estado_carrito,
  ci.idcarrito_items,
  p.idproductos_bar,
  p.nombre AS producto,
  ci.cantidad,
  ci.precio_unitario,
  (ci.cantidad * ci.precio_unitario) AS subtotal,
  SUM(ci.cantidad * ci.precio_unitario) OVER (PARTITION BY c.idcarrito) AS total_carrito
FROM carrito c
JOIN carrito_items ci ON ci.idcarrito = c.idcarrito
JOIN productos_bar p  ON p.idproductos_bar = ci.idproductos_bar;

-- ---------------------------------------------------------------------
--  DATOS INICIALES (opcionales)
-- ---------------------------------------------------------------------

INSERT INTO categorias_bar (nombre, descripcion) VALUES
  ('Batidos',   'Batidos a base de leche y frutas'),
  ('Yogures',   'Yogures naturales y saborizados'),
  ('Proteínas', 'Bebidas y batidos proteicos'),
  ('Snacks',    'Snacks saludables');

INSERT INTO productos_bar (nombre, descripcion, precio, stock, idcategorias_bar) VALUES
  ('Batido de fresa',      'Leche, fresa y hielo',              15.00, 50, 1),
  ('Batido de plátano',    'Leche, plátano y avena',            15.00, 50, 1),
  ('Yogur natural',        'Yogur natural sin azúcar 250 ml',   10.00, 40, 2),
  ('Yogur con granola',    'Yogur con granola y miel',          14.00, 30, 2),
  ('Batido proteico',      'Leche, whey y cacao',               22.00, 30, 3),
  ('Barra de cereal',      'Barra de cereal y frutos secos',     8.00, 60, 4);
