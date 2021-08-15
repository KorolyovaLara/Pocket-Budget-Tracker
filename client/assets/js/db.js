let db;

const request = indexedDB.open('pocket-budget_tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

const saveRecord = record => {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transObjectStore = transaction.objectStore('new_transaction');
    transObjectStore.add(record);
};

const uploadTransaction = () => {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transObjectStore = transaction.objectStore('new_transaction');
    const getAll = transObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST', 
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type' : 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    const transObjectStore = transaction.objectStore('new_transaction');
                    transObjectStore.clear();
                    alert('All saved budget transactions have been submitted!');
                    location.reload();
                })
                .catch(err => {
                    console.log(err);
                });
        };
    };
};

window.addEventListener('online', uploadTransaction);