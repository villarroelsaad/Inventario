# Registro

Sistema de inventario simple para el emprendimiento — productos, proveedores, categorías y
movimientos de stock. Se muestra en pantalla como "Registro" (nombre genérico a propósito).
Sin backend propio: el frontend habla directo a Supabase (base de datos, login y
almacenamiento de imágenes). Se aloja como sitio estático en GitHub Pages.

## 1. Crear el proyecto en Supabase

1. Entrar a [supabase.com](https://supabase.com), crear cuenta (gratis, sin tarjeta) y un
   proyecto nuevo.
2. Ir a **SQL Editor** y correr esto una sola vez:

```sql
create table categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text unique not null
);

create table productos (
  id text primary key,
  nombre text not null,
  categoria_id uuid references categorias(id),
  precio_venta numeric(12,2),
  costo numeric(12,2),
  stock integer not null default 0,
  stock_minimo integer default 0,
  imagen_url text,
  created_at timestamptz default now()
);

create table proveedores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  contacto text,
  notas text
);

create table producto_proveedor (
  producto_id text references productos(id) on delete cascade,
  proveedor_id uuid references proveedores(id) on delete cascade,
  costo numeric(12,2),
  primary key (producto_id, proveedor_id)
);

create table movimientos (
  id uuid primary key default gen_random_uuid(),
  producto_id text references productos(id) on delete cascade,
  tipo text not null check (tipo in ('entrada', 'salida')),
  cantidad integer not null check (cantidad > 0),
  motivo text,
  fecha timestamptz default now()
);

alter table categorias enable row level security;
alter table productos enable row level security;
alter table proveedores enable row level security;
alter table producto_proveedor enable row level security;
alter table movimientos enable row level security;

create policy "solo autenticado" on categorias for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "solo autenticado" on productos for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "solo autenticado" on proveedores for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "solo autenticado" on producto_proveedor for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "solo autenticado" on movimientos for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Registra un movimiento y actualiza el stock del producto en una sola
-- transacción atómica. Falla si una salida deja el stock en negativo.
create or replace function registrar_movimiento(
  p_producto_id text,
  p_tipo text,
  p_cantidad integer,
  p_motivo text default null
) returns void as $$
declare
  v_stock_actual integer;
begin
  if p_tipo not in ('entrada', 'salida') then
    raise exception 'Tipo de movimiento inválido';
  end if;

  select stock into v_stock_actual from productos where id = p_producto_id for update;

  if p_tipo = 'salida' and v_stock_actual - p_cantidad < 0 then
    raise exception 'No hay stock suficiente';
  end if;

  insert into movimientos (producto_id, tipo, cantidad, motivo)
  values (p_producto_id, p_tipo, p_cantidad, p_motivo);

  update productos
  set stock = stock + case when p_tipo = 'entrada' then p_cantidad else -p_cantidad end
  where id = p_producto_id;
end;
$$ language plpgsql security definer;
```

3. Ir a **Storage** y crear un bucket llamado `productos-imagenes`: público, límite de
   archivo 5MB, tipos permitidos `image/jpeg`, `image/png`, `image/webp`. Después, en el
   **SQL Editor**, correr esto para permitir subir/editar/borrar solo a usuarios logueados
   (la lectura pública ya la da el bucket público):

```sql
create policy "subir imagenes autenticado" on storage.objects for insert
  with check (bucket_id = 'productos-imagenes' and auth.role() = 'authenticated');
create policy "editar imagenes autenticado" on storage.objects for update
  using (bucket_id = 'productos-imagenes' and auth.role() = 'authenticated');
create policy "borrar imagenes autenticado" on storage.objects for delete
  using (bucket_id = 'productos-imagenes' and auth.role() = 'authenticated');
```

4. Ir a **Authentication → Users** y crear ahí el único usuario (email + contraseña) que va
   a usar la persona del emprendimiento para loguearse en la app.
5. Ir a **Settings → API** y copiar el **Project URL** y la **anon public key** (no la
   `service_role`, esa no se usa en este proyecto).

## 2. Correr en local

```bash
npm install
cp .env.example .env   # completar con la URL y la anon key de arriba
npm run dev
```

## 3. Tests

```bash
npm test
```

## 4. Deploy a GitHub Pages

1. Crear un repo en GitHub y subir este proyecto.
2. En el repo: **Settings → Pages → Source: GitHub Actions**.
3. En **Settings → Secrets and variables → Actions**, crear dos secrets:
   `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (los mismos valores del `.env`).
4. Cada push a `main` dispara `.github/workflows/deploy.yml`, que corre los tests, compila
   y publica en `https://<usuario>.github.io/<nombre-repo>/`.
5. Abrir esa dirección desde el celular y la PC, y usar "Agregar a pantalla de inicio" para
   instalarla como app.
