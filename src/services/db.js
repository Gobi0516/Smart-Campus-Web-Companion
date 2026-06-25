const DB_NAME = 'smart-campus-db';
const DB_VERSION = 2;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('lectures')) {
        db.createObjectStore('lectures', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('assignments')) {
        db.createObjectStore('assignments', { keyPath: 'id' });
      }
    };
  });
};

export const saveLectures = async (lectures) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['lectures'], 'readwrite');
    const store = transaction.objectStore('lectures');
    
    // Clear existing cache and add new ones
    const clearRequest = store.clear();
    
    clearRequest.onsuccess = () => {
      lectures.forEach(lecture => {
        store.put(lecture);
      });
    };

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

export const getLectures = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['lectures'], 'readonly');
    const store = transaction.objectStore('lectures');
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

export const getAssignments = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['assignments'], 'readonly');
    const store = transaction.objectStore('assignments');
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

export const saveAssignment = async (assignment) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['assignments'], 'readwrite');
    const store = transaction.objectStore('assignments');
    const request = store.put(assignment);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

export const saveLecture = async (lecture) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['lectures'], 'readwrite');
    const store = transaction.objectStore('lectures');
    const request = store.put(lecture);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

export const deleteLecture = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['lectures'], 'readwrite');
    const store = transaction.objectStore('lectures');
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};
