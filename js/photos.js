// ============================================================
// Fotos de progresso — IndexedDB (não cabem no localStorage)
// Comprimidas para ~900 px JPEG antes de salvar. Ficam só no aparelho.
// ============================================================
const DB = 'shape25-photos', STORE = 'photos';

function open() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id' });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

async function tx(mode, fn) {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction(STORE, mode);
    const out = fn(t.objectStore(STORE));
    t.oncomplete = () => res(out?.result ?? out);
    t.onerror = () => rej(t.error);
  });
}

export async function compress(file, max = 900, quality = 0.82) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => null);
  const src = bmp || await new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img); img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
  const scale = Math.min(1, max / Math.max(src.width, src.height));
  const c = document.createElement('canvas');
  c.width = Math.round(src.width * scale); c.height = Math.round(src.height * scale);
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob(res, 'image/jpeg', quality));
}

export async function addPhoto(file, date, pose) {
  const blob = await compress(file);
  const id = `${date}:${pose}:${Date.now()}`;
  await tx('readwrite', (s) => s.put({ id, date, pose, blob }));
  return id;
}

export const listPhotos = () => tx('readonly', (s) => s.getAll()).then((l) => (l || []).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)));
export const getPhoto = (id) => tx('readonly', (s) => s.get(id));
export const deletePhoto = (id) => tx('readwrite', (s) => s.delete(id));
