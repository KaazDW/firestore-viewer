import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

const firebaseConfig = {
//   conf firestore
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const panelsContainer = document.getElementById('panels');

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3000);
}

function displayCollections(collectionsToDisplay) {
  panelsContainer.innerHTML = ''; // Effacer les panneaux existants

  collectionsToDisplay.forEach((collectionName, index) => {
    const panel = document.createElement('div');
    panel.className = 'panel';

    const header = document.createElement('div');
    header.className = 'panel-header';
    header.textContent = `Collection: ${collectionName}`;
    panel.appendChild(header);

    const content = document.createElement('div');
    content.className = 'panel-content';
    panel.appendChild(content);

    panelsContainer.appendChild(panel);

    const q = query(collection(db, collectionName), orderBy("timestamp", "asc"));

    onSnapshot(q, (snapshot) => {
      content.innerHTML = '';
      let index = 1;

      snapshot.forEach(doc => {
        const documentDiv = document.createElement('div');
        documentDiv.className = 'document';

        const data = doc.data();
        const sortedKeys = Object.keys(data).sort();
        let structuredOutput = `<strong>${index}.</strong> <strong>${doc.id}</strong>: `;
        structuredOutput += sortedKeys
          .map(key => `<span class="key">${key}</span>=<span class="value">${data[key]}</span>`)
          .join(' | ');

        documentDiv.innerHTML = structuredOutput;

        documentDiv.addEventListener('click', () => {
          const documentText = `${index}. ${doc.id}: ` + sortedKeys
            .map(key => `${key}=${data[key]}`)
            .join(' | ');
          navigator.clipboard.writeText(documentText)
            .then(() => showToast('Document copied to clipboard!'))
            .catch(err => {
              console.error('Error copying document:', err);
              showToast('Failed to copy document.');
            });
        });

        content.appendChild(documentDiv);
        index++;
      });

      if (snapshot.empty) {
        content.innerHTML = `<div class="no-documents">No documents found in this collection.</div>`;
      }
    });
  });
}

const collectionsToDisplay = ["results", "testCollection"];
displayCollections(collectionsToDisplay);
